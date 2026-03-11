import React, { useMemo } from 'react';
import { Project, MaterialLeadTime, OrderItemStatus } from '../types';
import { calculateDeadline, formatDate } from '../utils/dateUtils';

export const OrderManagement = ({ 
  projects, 
  setProjects,
  allLeadTimes,
  selectedProjectId,
  setSelectedProjectId
}: { 
  projects: Project[], 
  setProjects: (projects: Project[]) => void,
  allLeadTimes: MaterialLeadTime[],
  selectedProjectId: string,
  setSelectedProjectId: (id: string) => void
}) => {
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const groupedLeadTimes = useMemo(() => {
    return allLeadTimes.reduce((acc, lt) => {
      if (!acc[lt.category]) acc[lt.category] = [];
      acc[lt.category].push(lt);
      return acc;
    }, {} as Record<string, MaterialLeadTime[]>);
  }, [allLeadTimes]);

  const updateItemStatus = (leadTimeId: string, updates: Partial<OrderItemStatus>) => {
    if (!selectedProject) return;
    
    const currentItems = selectedProject.orderItems || {};
    const currentStatus = currentItems[leadTimeId] || { isApplied: false, isOrdered: false };
    
    const newStatus = { ...currentStatus, ...updates };
    
    // Auto-record date when ordered
    if (updates.isOrdered === true && !currentStatus.isOrdered) {
      newStatus.orderDate = new Date().toISOString().split('T')[0];
    } else if (updates.isOrdered === false) {
      newStatus.orderDate = undefined;
    }

    const updatedProject = {
      ...selectedProject,
      orderItems: {
        ...currentItems,
        [leadTimeId]: newStatus
      }
    };
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const toggleAllApplied = (isApplied: boolean) => {
    if (!selectedProject) return;
    
    const newOrderItems = { ...(selectedProject.orderItems || {}) };
    allLeadTimes.forEach(lt => {
      const current = newOrderItems[lt.id] || { isApplied: false, isOrdered: false };
      newOrderItems[lt.id] = { ...current, isApplied };
    });

    const updatedProject = { ...selectedProject, orderItems: newOrderItems };
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const toggleAllOrdered = (isOrdered: boolean) => {
    if (!selectedProject) return;
    
    const newOrderItems = { ...(selectedProject.orderItems || {}) };
    allLeadTimes.forEach(lt => {
      const current = newOrderItems[lt.id] || { isApplied: false, isOrdered: false };
      if (current.isApplied) {
        newOrderItems[lt.id] = { 
          ...current, 
          isOrdered,
          orderDate: isOrdered ? (current.orderDate || new Date().toISOString().split('T')[0]) : undefined
        };
      }
    });

    const updatedProject = { ...selectedProject, orderItems: newOrderItems };
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const calculateAvailableTime = (deadline?: string) => {
    if (!deadline) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAvailableTimeColor = (days: number | string) => {
    if (typeof days !== 'number') return 'text-[#5A5A40]';
    if (days > 3) return 'text-emerald-600';
    if (days >= 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-10 bg-white rounded-3xl border border-[#5A5A40]/10 shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif italic text-[#5A5A40]">Gestión de Pedidos</h2>
      </div>
      
      <div className="mb-8">
        <label className="block text-xs uppercase tracking-widest mb-2 text-[#5A5A40]/70">Seleccionar Proyecto</label>
        <select 
          value={selectedProjectId} 
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full border border-[#5A5A40]/20 rounded-xl p-3 font-mono"
        >
          <option value="">Seleccione un proyecto...</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.code}-{p.name}</option>
          ))}
        </select>
      </div>
      
      {selectedProject && (
        <div className="mb-8 p-6 bg-[#5A5A40]/5 rounded-2xl border border-[#5A5A40]/10">
          <h3 className="text-lg font-serif italic text-[#5A5A40] mb-4">Fechas del Proyecto</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {selectedProject.modelingStartDate && <div><span className="font-bold">Modelado:</span> {formatDate(selectedProject.modelingStartDate)}</div>}
            {selectedProject.fabricationStartDate && <div><span className="font-bold">Fabricación:</span> {formatDate(selectedProject.fabricationStartDate)}</div>}
            {selectedProject.mainStructureAssemblyStartDate && <div><span className="font-bold">Montaje Estructura Ppal:</span> {formatDate(selectedProject.mainStructureAssemblyStartDate)}</div>}
            {selectedProject.secondaryStructureAssemblyStartDate && <div><span className="font-bold">Montaje Estructura Sec:</span> {formatDate(selectedProject.secondaryStructureAssemblyStartDate)}</div>}
            {selectedProject.roofCladdingAssemblyStartDate && <div><span className="font-bold">Montaje Cubierta:</span> {formatDate(selectedProject.roofCladdingAssemblyStartDate)}</div>}
            {selectedProject.sideCladdingAssemblyStartDate && <div><span className="font-bold">Montaje Lateral:</span> {formatDate(selectedProject.sideCladdingAssemblyStartDate)}</div>}
            {selectedProject.platesAssemblyStartDate && <div><span className="font-bold">Montaje Placas:</span> {formatDate(selectedProject.platesAssemblyStartDate)}</div>}
          </div>
        </div>
      )}
      
      {selectedProject && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#5A5A40]/5 text-[#5A5A40] text-xs uppercase tracking-widest border-b border-[#5A5A40]/20">
                <th className="p-4 text-left font-bold w-16">
                  <input 
                    type="checkbox" 
                    onChange={(e) => toggleAllApplied(e.target.checked)}
                    className="rounded border-[#5A5A40]/20 text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                </th>
                <th className="p-4 text-left font-bold">Ítem</th>
                <th className="p-4 text-center font-bold">Plazo Compra (días)</th>
                <th className="p-4 text-center font-bold">Fecha Límite Pedido</th>
                <th className="p-4 text-center font-bold">Tiempo Disponible</th>
                <th className="p-4 text-center font-bold">
                  <input 
                    type="checkbox" 
                    onChange={(e) => toggleAllOrdered(e.target.checked)}
                    className="rounded border-[#5A5A40]/20 text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                </th>
                <th className="p-4 text-center font-bold">Fecha Pedido</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(groupedLeadTimes) as [string, MaterialLeadTime[]][]).map(([category, items]) => (
                <React.Fragment key={category}>
                  <tr className="bg-[#5A5A40]/5">
                    <td colSpan={7} className="p-4 font-serif italic text-[#5A5A40] font-bold border-b border-[#5A5A40]/10">
                      {category}
                    </td>
                  </tr>
                  {items.map(lt => {
                    const status = selectedProject.orderItems?.[lt.id] || { isApplied: false, isOrdered: false };
                    
                    // Automatic deadline calculation if not manually set
                    const autoDeadline = calculateDeadline(selectedProject, lt);
                    const displayDeadline = status.orderDeadline || autoDeadline;
                    const availableDays = calculateAvailableTime(displayDeadline);
                    
                    return (
                      <tr key={lt.id} className={`border-b border-[#5A5A40]/10 hover:bg-[#5A5A40]/5 transition-colors ${!status.isApplied ? 'opacity-50' : ''}`}>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={status.isApplied}
                            onChange={(e) => updateItemStatus(lt.id, { isApplied: e.target.checked })}
                            className="rounded border-[#5A5A40]/20 text-[#5A5A40] focus:ring-[#5A5A40]"
                          />
                        </td>
                        <td className="p-4 pl-8 font-mono text-sm text-[#5A5A40]">
                          {lt.subCategory || lt.category}
                        </td>
                        <td className="p-4 text-center font-mono text-sm text-[#5A5A40]/70">
                          {lt.leadTimeDays}
                        </td>
                        <td className="p-4 text-center">
                          <input 
                            type="date" 
                            value={displayDeadline || ''}
                            onChange={(e) => updateItemStatus(lt.id, { orderDeadline: e.target.value })}
                            disabled={!status.isApplied}
                            className="border border-[#5A5A40]/20 rounded-lg p-1 text-xs font-mono disabled:bg-gray-100"
                          />
                        </td>
                        <td className={`p-4 text-center font-mono text-sm font-bold ${getAvailableTimeColor(availableDays)}`}>
                          {availableDays}
                        </td>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={status.isOrdered}
                            disabled={!status.isApplied}
                            onChange={(e) => updateItemStatus(lt.id, { isOrdered: e.target.checked })}
                            className="rounded border-[#5A5A40]/20 text-[#5A5A40] focus:ring-[#5A5A40] disabled:opacity-50"
                          />
                        </td>
                        <td className="p-4 text-center font-mono text-xs text-[#5A5A40]/70">
                          {status.orderDate || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
