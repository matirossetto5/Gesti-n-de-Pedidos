import React, { useState, useMemo } from 'react';
import { Project, MaterialLeadTime } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { AlertCircle, CheckCircle2, Clock, Download, List } from 'lucide-react';
import { calculateDeadline } from '../utils/dateUtils';
import { ProgressBar } from './ProgressBar';

interface DashboardProps {
  projects: Project[];
  allLeadTimes: MaterialLeadTime[];
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, allLeadTimes }) => {
  const [filterProjectId, setFilterProjectId] = useState('all');
  const [filterItem, setFilterItem] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const stats = useMemo(() => {
    let totalApplied = 0;
    let totalOrdered = 0;
    const pendingItems: any[] = [];
    const projectStats: any[] = [];

    projects.forEach(project => {
      let projectApplied = 0;
      let projectOrdered = 0;

      allLeadTimes.forEach(lt => {
        const status = project.orderItems?.[lt.id];
        if (status?.isApplied) {
          totalApplied++;
          projectApplied++;
          
          if (status.isOrdered) {
            totalOrdered++;
            projectOrdered++;
          } else {
            const deadline = status.orderDeadline || calculateDeadline(project, lt);
            pendingItems.push({
              projectName: project.name,
              projectCode: project.code,
              item: lt.subCategory || lt.category,
              deadline: deadline || 'Sin fecha',
              daysLeft: deadline ? Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
            });
          }
        }
      });

      projectStats.push({
        name: project.code,
        fullName: project.name,
        aplicados: projectApplied,
        pedidos: projectOrdered,
        pendientes: projectApplied - projectOrdered,
        progress: projectApplied > 0 ? (projectOrdered / projectApplied) * 100 : 0
      });
    });

    return {
      totalApplied,
      totalOrdered,
      totalPending: totalApplied - totalOrdered,
      pendingItems: pendingItems.sort((a, b) => {
        if (!a.deadline || a.deadline === 'Sin fecha') return 1;
        if (!b.deadline || b.deadline === 'Sin fecha') return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }),
      projectStats,
      pieData: [
        { name: 'Pedidos', value: totalOrdered, color: '#10b981' },
        { name: 'Pendientes', value: totalApplied - totalOrdered, color: '#ef4444' }
      ]
    };
  }, [projects, allLeadTimes]);

  const filteredPendingItems = useMemo(() => {
    return stats.pendingItems.filter(item => {
      const matchesProject = filterProjectId === 'all' || item.projectCode === filterProjectId;
      const matchesItem = !filterItem || item.item.toLowerCase().includes(filterItem.toLowerCase());
      
      const itemDate = item.deadline !== 'Sin fecha' ? new Date(item.deadline) : null;
      const matchesStartDate = !filterStartDate || (itemDate && itemDate >= new Date(filterStartDate));
      const matchesEndDate = !filterEndDate || (itemDate && itemDate <= new Date(filterEndDate));
      
      return matchesProject && matchesItem && matchesStartDate && matchesEndDate;
    });
  }, [stats.pendingItems, filterProjectId, filterItem, filterStartDate, filterEndDate]);

  const getAvailableTimeColor = (days: number | null) => {
    if (days === null) return 'text-[#003366]/40 dark:text-gray-400';
    if (days > 3) return 'text-emerald-600 dark:text-emerald-400';
    if (days >= 1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const exportToPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const { default: domtoimage } = await import('dom-to-image');
    const { default: jsPDF } = await import('jspdf');

    const dataUrl = await domtoimage.toPng(element);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-[#003366]/10 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-[#003366]/5 dark:bg-gray-700 text-[#003366] dark:text-blue-400 rounded-2xl">
            <List size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#003366]/60 dark:text-gray-400 font-bold">Total Aplicados</p>
            <p className="text-2xl font-mono font-bold text-[#003366] dark:text-white">{stats.totalApplied}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-[#003366]/10 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#003366]/60 dark:text-gray-400 font-bold">Pedidos Realizados</p>
            <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats.totalOrdered}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-[#003366]/10 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#003366]/60 dark:text-gray-400 font-bold">Pedidos Pendientes</p>
            <p className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">{stats.totalPending}</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-[#003366]/10 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-serif italic text-[#003366] dark:text-white mb-6">Progreso por Proyecto</h3>
        <div className="space-y-4">
          {stats.projectStats.map(p => (
            <div key={p.name}>
              <div className="flex justify-between text-xs mb-1 dark:text-gray-300">
                <span className="font-bold">{p.name} - {p.fullName}</span>
                <span>{Math.round(p.progress)}%</span>
              </div>
              <ProgressBar progress={p.progress} />
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div id="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-[#003366]/10 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif italic text-[#003366] dark:text-white">Estado Global de Pedidos</h3>
            <button 
              onClick={() => exportToPDF('dashboard-charts', 'dashboard-graficos')}
              className="p-2 hover:bg-[#003366]/5 dark:hover:bg-gray-700 rounded-xl transition-colors text-[#003366]/60 dark:text-gray-400"
              title="Exportar Gráficos"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-[#003366]/10 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-serif italic text-[#003366] dark:text-white mb-6">Pedidos por Proyecto</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.projectStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00336610" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#00336660'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#00336660'}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pedidos" fill="#10b981" radius={[4, 4, 0, 0]} name="Realizados" />
                <Bar dataKey="pendientes" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending List Section */}
      <div id="pending-list" className="bg-white dark:bg-gray-800 rounded-3xl border border-[#5A5A40]/10 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#5A5A40]/10 dark:border-gray-700 bg-[#5A5A40]/5 dark:bg-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-serif italic text-[#5A5A40] dark:text-white">Lista de Pedidos Pendientes</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#5A5A40]/60 dark:text-gray-400 font-bold">Ordenados por fecha límite</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select 
                value={filterProjectId} 
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="border border-[#5A5A40]/20 dark:border-gray-600 rounded-xl p-2 text-xs font-mono dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los proyectos</option>
                {projects.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
              </select>
              <input 
                type="text" 
                value={filterItem} 
                onChange={(e) => setFilterItem(e.target.value)} 
                placeholder="Filtrar por ítem..."
                className="border border-[#5A5A40]/20 dark:border-gray-600 rounded-xl p-2 text-xs font-mono dark:bg-gray-700 dark:text-white" 
              />
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="border border-[#5A5A40]/20 dark:border-gray-600 rounded-xl p-2 text-xs font-mono dark:bg-gray-700 dark:text-white" />
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="border border-[#5A5A40]/20 dark:border-gray-600 rounded-xl p-2 text-xs font-mono dark:bg-gray-700 dark:text-white" />
              <button 
                onClick={() => exportToPDF('pending-list', 'pedidos-pendientes')}
                className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] dark:bg-gray-700 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-[#5A5A40]/90 transition-all"
              >
                <Download size={16} />
                EXPORTAR PDF
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[#5A5A40] dark:text-gray-300 text-[10px] uppercase tracking-widest border-b border-[#5A5A40]/10 dark:border-gray-700">
                <th className="p-4 text-left font-bold">Proyecto</th>
                <th className="p-4 text-left font-bold">Material / Categoría</th>
                <th className="p-4 text-center font-bold">Fecha Límite</th>
                <th className="p-4 text-center font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingItems.length > 0 ? (
                filteredPendingItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#5A5A40]/5 dark:border-gray-700 hover:bg-[#5A5A40]/2 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-[#5A5A40] dark:text-white">{item.projectCode}</span>
                        <span className="text-[10px] text-[#5A5A40]/60 dark:text-gray-400">{item.projectName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-[#5A5A40] dark:text-gray-300">
                      {item.item}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-mono text-[#5A5A40] dark:text-gray-300">{item.deadline}</span>
                        {item.daysLeft !== null && (
                          <span className={`text-[9px] font-bold uppercase ${getAvailableTimeColor(item.daysLeft)}`}>
                            {item.daysLeft < 0 ? `Vencido (${Math.abs(item.daysLeft)}d)` : `${item.daysLeft} días restantes`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[9px] font-bold uppercase">
                        <Clock size={10} />
                        Pendiente
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[#5A5A40]/40 dark:text-gray-500 font-serif italic">
                    No hay pedidos pendientes que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
