import { useState } from 'react';
import { Project } from '../types';

export const ProjectList = ({ 
  projects, 
  onAddProject,
  onEditProject,
  onDeleteProject
}: { 
  projects: Project[], 
  onAddProject: () => void,
  onEditProject: (project: Project) => void,
  onDeleteProject: (projectId: string) => void
}) => {
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [historyToShow, setHistoryToShow] = useState<Project | null>(null);

  const handleDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div>
      {historyToShow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Historial de cambios de fechas: {historyToShow.code}-{historyToShow.name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Campo</th>
                    <th className="p-2">Anterior</th>
                    <th className="p-2">Nuevo</th>
                    <th className="p-2">Razón</th>
                  </tr>
                </thead>
                <tbody>
                  {(historyToShow.dateChangeLogs || []).map((log, i) => (
                    <tr key={`${log.date}-${log.field}-${log.newValue}-${i}`} className="border-b border-gray-100">
                      <td className="p-2">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-2">{log.field}</td>
                      <td className="p-2">{log.oldValue || '-'}</td>
                      <td className="p-2">{log.newValue || '-'}</td>
                      <td className="p-2">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setHistoryToShow(null)}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">¿Confirmar eliminación?</h3>
            <p className="mb-6 text-gray-600">
              ¿Estás seguro de que quieres eliminar el proyecto {projectToDelete.code}-{projectToDelete.name}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-serif italic text-[#003366]">Proyectos Activos</h2>
        <button onClick={onAddProject} className="bg-[#003366] text-white px-8 py-3 rounded-full uppercase text-xs tracking-widest">Agregar Proyecto</button>
      </div>
      <div className="border-t border-[#003366]/20">
        {projects.length === 0 ? (
          <div className="p-12 text-center font-mono text-sm text-[#003366]/50">No hay proyectos creados.</div>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id} 
              className="grid grid-cols-[1fr,auto,auto,auto,auto] p-6 border-b border-[#003366]/20 font-mono text-sm items-center hover:bg-[#003366]/5 transition-colors"
            >
              <div className="font-bold text-[#003366]">{project.code}-{project.name}</div>
              <div className="text-[#003366]/70 mr-4">Resp: {project.responsibleName || 'No asignado'}</div>
              <button 
                onClick={() => onEditProject(project)}
                className="border border-[#003366]/30 text-[#003366] px-4 py-2 rounded-full uppercase text-xs tracking-widest hover:bg-[#003366] hover:text-white transition-all mr-2"
              >
                Editar
              </button>
              <button 
                onClick={() => setHistoryToShow(project)}
                className="border border-[#003366]/30 text-[#003366] px-4 py-2 rounded-full uppercase text-xs tracking-widest hover:bg-[#003366] hover:text-white transition-all mr-2"
              >
                Historial
              </button>
              <button 
                onClick={() => setProjectToDelete(project)}
                className="border border-red-500/30 text-red-600 px-4 py-2 rounded-full uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
