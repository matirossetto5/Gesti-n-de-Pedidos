import React, { useMemo, useState } from 'react';
import { Project, MaterialLeadTime, OrderItemStatus } from '../types';
import { calculateDeadline, formatDate } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';

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
  const [filterText, setFilterText] = useState('');
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const filteredLeadTimes = useMemo(() => {
    if (!filterText) return allLeadTimes;
    return allLeadTimes.filter(lt => 
      (lt.subCategory || lt.category).toLowerCase().includes(filterText.toLowerCase())
    );
  }, [allLeadTimes, filterText]);

  const groupedLeadTimes = useMemo(() => {
    return filteredLeadTimes.reduce((acc, lt) => {
      if (!acc[lt.category]) acc[lt.category] = [];
      acc[lt.category].push(lt);
      return acc;
    }, {} as Record<string, MaterialLeadTime[]>);
  }, [filteredLeadTimes]);

  const updateItemStatus = (leadTimeId: string, updates: Partial<OrderItemStatus>) => {
    if (!selectedProject) return;
    
    const currentItems = selectedProject.orderItems || {};
    const currentStatus = currentItems[leadTimeId] || { isApplied: false, isOrdered: false };
    
    const newStatus = { ...currentStatus, ...updates };
    
    // Auto-record date when ordered
    if (updates.isOrdered === true && !currentStatus.isOrdered) {
      newStatus.orderDate = new Date().toISOString().split('T')[0];
      toast.success('Pedido marcado como realizado');
    } else if (updates.isOrdered === false) {
      newStatus.orderDate = undefined;
      toast.success('Pedido marcado como pendiente');
    } else {
      toast.success('Estado actualizado');
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
    toast.success(isApplied ? 'Todos los ítems aplicados' : 'Todos los ítems desaplicados');
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
    toast.success(isOrdered ? 'Todos los ítems pedidos' : 'Todos los ítems pendientes');
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
    if (typeof days !== 'number') return 'text-[#5A5A40] dark:text-gray-400';
    if (days > 3) return 'text-emerald-600 dark:text-emerald-400';
    if (days >= 1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="p-4 md:p-10 bg-white dark:bg-gray-800 rounded-3xl border border-[#5A5A40]/10 dark:border-gray-700 shadow-lg transition-colors">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif italic text-[#5A5A40] dark:text-white">Gestión de Pedidos</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#5A5A40]/70 dark:text-gray-400">Seleccionar Proyecto</label>
          <select 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full border border-[#5A5A40]/20 dark:border-gray-600 rounded-xl p-3 font-mono dark:bg-gray-700 dark:text-white"
          >
            <option value="">Seleccione un proyecto...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code}-{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#5A5A40]/70 dark:text-gray-400">Filtrar por Ítem</label>
          <input 
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar ítem..."
            className="w-full border border-[#5A5A40]/20 dark:border-gray-600 rounded-xl p-3 font-mono dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      {selectedProject && (
        <div className="mb-8 p-6 bg-[#5A5A40]/5 dark:bg-gray-900 rounded-2xl border border-[#5A5A40]/10 dark:border-gray-700">
          <h3 className="text-lg font-serif italic text-[#5A5A40] dark:text-white mb-4">Fechas del Proyecto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs dark:text-gray-300">
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
              <tr className="bg-[#5A5A40]/5 dark:bg-gray-700 text-[#5A5A40] dark:text-gray-300 text-xs uppercase tracking-widest border-b border-[#5A5A40]/20 dark:border-gray-600">
                <th className="p-4 text-left font-bold w-16">
                  <input 
                    type="checkbox" 
                    onChange={(e) => toggleAllApplied(e.target.checked)}
                    className="rounded border-[#5A5A40]/20 dark:border-gray-600 text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                </th>
                <th className="p-4 text-left font-bold">Ítem</th>
                <th className="p-4 text-center font-bold hidden md:table-cell">Plazo Compra (días)</th>
                <th className="p-4 text-center font-bold">Fecha Límite Pedido</th>
                <th className="p-4 text-center font-bold hidden md:table-cell">Tiempo Disponible</th>
                <th className="p-4 text-center font-bold">
                  <input 
                    type="checkbox" 
                    onChange={(e) => toggleAllOrdered(e.target.checked)}
                    className="rounded border-[#5A5A40]/20 dark:border-gray-600 text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                </th>
                <th className="p-4 text-center font-bold hidden md:table-cell">Fecha Pedido</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(groupedLeadTimes) as [string, MaterialLeadTime[]][]).map(([category, items]) => (
                <React.Fragment key={category}>
                  <tr className="bg-[#5A5A40]/5 dark:bg-gray-900">
                    <td colSpan={7} className="p-4 font-serif italic text-[#5A5A40] dark:text-white font-bold border-b border-[#5A5A40]/10 dark:border-gray-700">
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
                      <tr key={lt.id} className={`border-b border-[#5A5A40]/10 dark:border-gray-700 hover:bg-[#5A5A40]/5 dark:hover:bg-gray-700 transition-colors ${!status.isApplied ? 'opacity-50' : ''}`}>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={status.isApplied}
                            onChange={(e) => updateItemStatus(lt.id, { isApplied: e.target.checked })}
                            className="rounded border-[#5A5A40]/20 dark:border-gray-600 text-[#5A5A40] focus:ring-[#5A5A40]"
                          />
                        </td>
                        <td className="p-4 pl-8 font-mono text-sm text-[#5A5A40] dark:text-gray-300">
                          {lt.subCategory || lt.category}
                        </td>
                        <td className="p-4 text-center font-mono text-sm text-[#5A5A40]/70 dark:text-gray-400 hidden md:table-cell">
                          {lt.leadTimeDays}
                        </td>
                        <td className="p-4 text-center">
                          <input 
                            type="date" 
                            value={displayDeadline || ''}
                            onChange={(e) => updateItemStatus(lt.id, { orderDeadline: e.target.value })}
                            disabled={!status.isApplied}
                            className="border border-[#5A5A40]/20 dark:border-gray-600 rounded-lg p-1 text-xs font-mono disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-700 dark:text-white"
                          />
                        </td>
                        <td className={`p-4 text-center font-mono text-sm font-bold ${getAvailableTimeColor(availableDays)} hidden md:table-cell`}>
                          {availableDays}
                        </td>
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={status.isOrdered}
                            disabled={!status.isApplied}
                            onChange={(e) => updateItemStatus(lt.id, { isOrdered: e.target.checked })}
                            className="rounded border-[#5A5A40]/20 dark:border-gray-600 text-[#5A5A40] focus:ring-[#5A5A40] disabled:opacity-50"
                          />
                        </td>
                        <td className="p-4 text-center font-mono text-xs text-[#5A5A40]/70 dark:text-gray-400 hidden md:table-cell">
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
