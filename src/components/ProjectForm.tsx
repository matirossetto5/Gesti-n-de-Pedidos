import React, { useState } from 'react';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProjectForm = ({ 
  addProject, 
  onCancel, 
  initialProject
}: { 
  addProject: (project: Project) => void, 
  onCancel: () => void,
  initialProject?: Project
}) => {
  const { user } = useAuth();
  const [code, setCode] = useState(initialProject?.code || '');
  const [name, setName] = useState(initialProject?.name || '');
  const [responsibleName, setResponsibleName] = useState(initialProject?.responsibleName || '');
  const [modelingStartDate, setModelingStartDate] = useState(initialProject?.modelingStartDate || '');
  const [fabricationStartDate, setFabricationStartDate] = useState(initialProject?.fabricationStartDate || '');
  const [mainStructureAssemblyStartDate, setMainStructureAssemblyStartDate] = useState(initialProject?.mainStructureAssemblyStartDate || '');
  const [secondaryStructureAssemblyStartDate, setSecondaryStructureAssemblyStartDate] = useState(initialProject?.secondaryStructureAssemblyStartDate || '');
  const [roofCladdingAssemblyStartDate, setRoofCladdingAssemblyStartDate] = useState(initialProject?.roofCladdingAssemblyStartDate || '');
  const [sideCladdingAssemblyStartDate, setSideCladdingAssemblyStartDate] = useState(initialProject?.sideCladdingAssemblyStartDate || '');
  const [platesAssemblyStartDate, setPlatesAssemblyStartDate] = useState(initialProject?.platesAssemblyStartDate || '');
  const [changeReason, setChangeReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const dateLogs = [];
      if (initialProject) {
        const dateFields = {
          modelingStartDate,
          fabricationStartDate,
          mainStructureAssemblyStartDate,
          secondaryStructureAssemblyStartDate,
          roofCladdingAssemblyStartDate,
          sideCladdingAssemblyStartDate,
          platesAssemblyStartDate
        };
        
        for (const [field, value] of Object.entries(dateFields)) {
          if (value !== initialProject[field as keyof Project]) {
            dateLogs.push({
              date: new Date().toISOString(),
              field,
              oldValue: initialProject[field as keyof Project] as string,
              newValue: value,
              reason: changeReason,
              changedBy: user?.email || 'admin'
            });
          }
        }
      }

      const newProject: Project = {
        id: initialProject?.id || Date.now().toString(),
        code,
        name,
        ownerId: initialProject?.ownerId || user?.uid || '',
        responsibleName,
        createdAt: initialProject?.createdAt || new Date().toISOString(),
        modelingStartDate,
        fabricationStartDate,
        mainStructureAssemblyStartDate,
        secondaryStructureAssemblyStartDate,
        roofCladdingAssemblyStartDate,
        sideCladdingAssemblyStartDate,
        platesAssemblyStartDate,
        orderItems: initialProject?.orderItems,
        dateChangeLogs: [...(initialProject?.dateChangeLogs || []), ...dateLogs],
      };
      
      await addProject(newProject);
      onCancel();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Error al guardar el proyecto. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 bg-white rounded-3xl border border-[#003366]/10 shadow-lg">
      <h2 className="text-3xl font-serif italic mb-8 text-[#003366]">{initialProject ? 'Editar Proyecto' : 'Agregar Nuevo Proyecto'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialProject && (
          <div className="mb-4 col-span-2">
            <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Razón del cambio de fechas</label>
            <input type="text" value={changeReason} onChange={(e) => setChangeReason(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" required={!!initialProject} />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Código (XX)</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" required />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Nombre</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" required />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Nombre del Responsable</label>
          <input type="text" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" required />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Inicio Modelado</label>
          <input type="date" value={modelingStartDate} onChange={(e) => setModelingStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Inicio Fabricación</label>
          <input type="date" value={fabricationStartDate} onChange={(e) => setFabricationStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Montaje Estructura Principal</label>
          <input type="date" value={mainStructureAssemblyStartDate} onChange={(e) => setMainStructureAssemblyStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Montaje Estructura Secundaria</label>
          <input type="date" value={secondaryStructureAssemblyStartDate} onChange={(e) => setSecondaryStructureAssemblyStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Montaje Cerramientos Cubierta</label>
          <input type="date" value={roofCladdingAssemblyStartDate} onChange={(e) => setRoofCladdingAssemblyStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Montaje Cerramientos Lateral</label>
          <input type="date" value={sideCladdingAssemblyStartDate} onChange={(e) => setSideCladdingAssemblyStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-2 text-[#003366]/70">Montaje de Pletinas</label>
          <input type="date" value={platesAssemblyStartDate} onChange={(e) => setPlatesAssemblyStartDate(e.target.value)} className="w-full border border-[#003366]/20 rounded-xl p-3 font-mono" />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button type="submit" disabled={isLoading} className="bg-[#003366] text-white px-8 py-3 rounded-full uppercase text-xs tracking-widest disabled:opacity-50">
          {isLoading ? 'Guardando...' : (initialProject ? 'Guardar Cambios' : 'Crear Proyecto')}
        </button>
        <button type="button" onClick={onCancel} className="border border-[#003366]/30 text-[#003366] px-8 py-3 rounded-full uppercase text-xs tracking-widest">Cancelar</button>
      </div>
    </form>
  );
};
