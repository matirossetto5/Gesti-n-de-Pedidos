import React, { useState, useMemo } from 'react';
import { Project, MaterialLeadTime } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Download } from 'lucide-react';
import { calculateDeadline } from '../utils/dateUtils';

interface ProjectCalendarProps {
  projects: Project[];
  allLeadTimes: MaterialLeadTime[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ 
  projects, 
  allLeadTimes,
  selectedProjectId,
  setSelectedProjectId
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const logoUrl = "https://media.licdn.com/dms/image/v2/C4E0BAQENkX0orEV8KQ/company-logo_200_200/company-logo_200_200/0/1630620084700?e=2147483647&v=beta&t=8OGYSccaJ78FnSmrdWKlTs0G_EYREXv8gvSJoIaL-DQ";

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const filteredProjects = useMemo(() => {
    if (selectedProjectId === 'all') return projects;
    return projects.filter(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const exportToPDF = async () => {
    const element = document.getElementById('project-calendar-view');
    if (!element) return;

    const { default: domtoimage } = await import('dom-to-image');
    const { default: jsPDF } = await import('jspdf');

    // Increase resolution for better quality
    const scale = 2;
    const dataUrl = await domtoimage.toPng(element, {
      width: element.offsetWidth * scale,
      height: element.offsetHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${element.offsetWidth}px`,
        height: `${element.offsetHeight}px`
      }
    });
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const usableWidth = pdfWidth - (margin * 2);
    const usableHeight = (element.offsetHeight * usableWidth) / element.offsetWidth;
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Calendario de Proyectos', pdfWidth / 2, margin - 2, { align: 'center' });

    pdf.addImage(dataUrl, 'PNG', margin, margin, usableWidth, usableHeight);
    pdf.save('calendario-proyectos.pdf');
  };

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysCount = daysInMonth(year, month);
      const firstDay = firstDayOfMonth(year, month);
      
      const days = [];
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysCount; i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    } else {
      // Week view: Find the start of the current week (Sunday)
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
      return days;
    }
  }, [currentDate, viewMode]);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const events: { projectName: string; projectCode: string; eventType: string; color: string; isDeadline?: boolean }[] = [];

    filteredProjects.forEach(project => {
        // Check Order Deadlines (Manual and Automatic)
        allLeadTimes.forEach(lt => {
          const itemStatus = project.orderItems?.[lt.id];
          const manualDeadline = itemStatus?.orderDeadline;
          const autoDeadline = calculateDeadline(project, lt);
          const finalDeadline = manualDeadline || autoDeadline;

          if (finalDeadline === dateStr && itemStatus?.isApplied === true) {
            const label = `${lt.category}${lt.subCategory ? ` (${lt.subCategory})` : ''}`;
            events.push({ 
              projectName: project.name, 
              projectCode: project.code,
              eventType: `LÍMITE: ${label}`, 
              color: 'bg-amber-500',
              isDeadline: true
            });
          }
        });

        // Check Milestones
        const milestones = [
          { field: 'modelingStartDate', label: 'Modelado' },
          { field: 'fabricationStartDate', label: 'Fabricación' },
          { field: 'mainStructureAssemblyStartDate', label: 'Montaje Est. Principal' },
          { field: 'secondaryStructureAssemblyStartDate', label: 'Montaje Est. Secundaria' },
          { field: 'roofCladdingAssemblyStartDate', label: 'Montaje Cubierta' },
          { field: 'sideCladdingAssemblyStartDate', label: 'Montaje Cerramiento' },
          { field: 'platesAssemblyStartDate', label: 'Montaje Placas' },
        ] as const;

        milestones.forEach(m => {
          const date = project[m.field as keyof Project];
          if (date === dateStr) {
            events.push({ 
              projectName: project.name, 
              projectCode: project.code,
              eventType: `HITO: ${m.label}`, 
              color: 'bg-blue-500'
            });
          }
        });
    });

    return events;
  };

  return (
    <div id="project-calendar-view" className="bg-white rounded-3xl shadow-sm border border-[#003366]/10 overflow-hidden">
      <div className="p-8 border-b border-[#003366]/10 bg-[#003366]/5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#003366] text-white rounded-2xl shadow-lg">
              <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-[#003366]">Calendario de Proyectos</h2>
              <p className="text-xs uppercase tracking-widest text-[#003366]/60 font-bold">Cronograma e Hitos de Pedido</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center bg-white border border-[#003366]/20 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('month')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366]/60 hover:bg-[#003366]/5'}`}
              >
                MES
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-[#003366] text-white shadow-md' : 'text-[#003366]/60 hover:bg-[#003366]/5'}`}
              >
                SEMANA
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#003366]/20 rounded-xl px-3 py-2 shadow-sm">
              <Filter size={16} className="text-[#003366]/60" />
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-sm font-mono text-[#003366] focus:outline-none min-w-[200px]"
              >
                <option value="all">Todos los proyectos</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 bg-white border border-[#003366]/20 rounded-xl px-4 py-2 shadow-sm">
              <button onClick={handlePrev} className="p-1 hover:bg-[#003366]/10 rounded-full transition-colors text-[#003366]">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-serif italic text-[#003366] min-w-[140px] text-center">
                {viewMode === 'month' ? (
                  `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                ) : (
                  `Semana ${Math.ceil(currentDate.getDate() / 7)} - ${monthNames[currentDate.getMonth()]}`
                )}
              </span>
              <button onClick={handleNext} className="p-1 hover:bg-[#003366]/10 rounded-full transition-colors text-[#003366]">
                <ChevronRight size={20} />
              </button>
            </div>

            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold shadow-lg hover:bg-[#003366]/90 transition-all"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-[#003366]/5 border-b border-[#003366]/10">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-4 text-center text-[10px] uppercase tracking-widest font-bold text-[#003366]/60">
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${viewMode === 'month' ? 'auto-rows-[140px]' : 'auto-rows-[400px]'}`}>
        {calendarDays.map((date, idx) => {
          const events = date ? getEventsForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();

          return (
            <div 
              key={date ? date.toISOString() : `empty-${idx}`} 
              className={`p-2 border-r border-b border-[#003366]/5 relative transition-colors hover:bg-[#003366]/2 ${!date ? 'bg-[#f5f5f0]/30' : ''}`}
            >
              {date && (
                <>
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-mono ${isToday ? 'bg-[#003366] text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-[#003366]/40'}`}>
                      {date.getDate()}
                    </span>
                    {viewMode === 'week' && (
                      <span className="text-[10px] text-[#003366]/30 font-bold uppercase">
                        {monthNames[date.getMonth()].substring(0, 3)}
                      </span>
                    )}
                  </div>
                  <div className={`mt-1 space-y-1 overflow-y-auto custom-scrollbar ${viewMode === 'month' ? 'max-h-[105px]' : 'max-h-[360px]'}`}>
                    {events.map((event, eIdx) => (
                      <div 
                        key={`${event.projectCode}-${event.eventType}-${eIdx}`} 
                        className={`${event.color} text-[9px] text-white px-1.5 py-0.5 rounded-md truncate shadow-sm font-bold uppercase tracking-tighter`}
                        title={`${event.projectName}: ${event.eventType}`}
                      >
                        {selectedProjectId === 'all' && <span className="opacity-70 mr-1">[{event.projectCode}]</span>}
                        {event.eventType}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-[#f5f5f0]/50 border-t border-[#5A5A40]/10">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {[
            { label: 'LÍMITE PEDIDO', color: 'bg-amber-500' },
            { label: 'HITO', color: 'bg-blue-500' },
          ].map(legend => (
            <div key={legend.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${legend.color}`}></div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A5A40]/70">{legend.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
