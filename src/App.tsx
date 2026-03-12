/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { ProjectForm } from './components/ProjectForm';
import { ProjectList } from './components/ProjectList';
import { LeadTimeManager } from './components/LeadTimeManager';
import { OrderManagement } from './components/OrderManagement';
import { ProjectCalendar } from './components/ProjectCalendar';
import { Dashboard } from './components/Dashboard';
import { Project, MaterialLeadTime } from './types';
import { Settings2, LayoutDashboard, FolderKanban, CalendarDays, LogOut, Sun, Moon } from 'lucide-react';
import { useFirestoreData } from './hooks/useFirestore';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { projects, leadTimes, loading, error, saveProject, deleteProject, updateLeadTime } = useFirestoreData(user);
  const [activeTab, setActiveTab] = useState<'projects' | 'lead-times' | 'add-project' | 'order-management' | 'calendar' | 'dashboard'>('dashboard');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  useEffect(() => {
    const migrateData = async () => {
      const savedProjects = localStorage.getItem('projects');
      const savedLeadTimes = localStorage.getItem('leadTimes');
      
      if (savedProjects && savedProjects !== "undefined" && user) {
        const projects: Project[] = JSON.parse(savedProjects);
        for (const project of projects) {
          await saveProject({ ...project, ownerId: user.uid });
        }
        localStorage.removeItem('projects');
      }
      
      if (savedLeadTimes && savedLeadTimes !== "undefined" && user) {
        const leadTimes: MaterialLeadTime[] = JSON.parse(savedLeadTimes);
        for (const lt of leadTimes) {
          await updateLeadTime({ ...lt, ownerId: user.uid });
        }
        localStorage.removeItem('leadTimes');
      }
    };
    
    if (!loading && user && !error) {
      migrateData();
    }
  }, [loading, user, error]);

  if (!user) return <AuthForm />;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Cargando...</div>;

  return (
    <div className="min-h-screen p-8 bg-[#f5f5f0] dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <Toaster position="top-right" />
      <header className="mb-12 border-b border-[#003366]/20 dark:border-gray-700 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <img src="https://media.licdn.com/dms/image/v2/C4E0BAQENkX0orEV8KQ/company-logo_200_200/company-logo_200_200/0/1630620084700?e=2147483647&v=beta&t=8OGYSccaJ78FnSmrdWKlTs0G_EYREXv8gvSJoIaL-DQ" alt="Logo" className="h-12 w-auto rounded-full" />
              <h1 className="text-5xl font-serif italic text-[#003366] dark:text-white">Gestión de pedidos</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-[#003366]/30 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-[#003366]/5 dark:hover:bg-gray-800 transition-all"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button 
                onClick={() => setActiveTab('lead-times')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${activeTab === 'lead-times' ? 'bg-[#003366] text-white shadow-md dark:bg-gray-700' : 'border border-[#003366]/30 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-[#003366]/5 dark:hover:bg-gray-800'}`}
              >
                <Settings2 size={16} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Tiempos</span>
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#003366]/30 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-all"
              >
                <LogOut size={16} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Salir</span>
              </button>
            </div>
          </div>
          
          <nav className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-[#003366] text-white shadow-lg dark:bg-gray-700' : 'border border-[#003366]/20 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-[#003366]/5 dark:hover:bg-gray-800'}`}
            >
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('order-management')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === 'order-management' ? 'bg-[#003366] text-white shadow-lg dark:bg-gray-700' : 'border border-[#003366]/20 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-[#003366]/5 dark:hover:bg-gray-800'}`}
            >
              <LayoutDashboard size={18} />
              <span className="font-medium">Gestión de pedidos</span>
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === 'calendar' ? 'bg-[#003366] text-white shadow-lg dark:bg-gray-700' : 'border border-[#003366]/20 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-[#003366]/5 dark:hover:bg-gray-800'}`}
            >
              <CalendarDays size={18} />
              <span className="font-medium">Calendario</span>
            </button>
            <button 
              onClick={() => { setActiveTab('projects'); setEditingProject(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === 'projects' ? 'bg-[#003366] text-white shadow-lg dark:bg-gray-700' : 'border border-[#003366]/20 dark:border-gray-600 text-[#003366] dark:text-gray-300 hover:bg-[#003366]/5 dark:hover:bg-gray-800'}`}
            >
              <FolderKanban size={18} />
              <span className="font-medium">Proyectos</span>
            </button>
          </nav>
        </header>

        <main>
          {activeTab === 'projects' && (
            <ProjectList 
              projects={projects} 
              onAddProject={() => { setActiveTab('add-project'); setEditingProject(null); }}
              onEditProject={(project) => { setEditingProject(project); setActiveTab('add-project'); }}
              onDeleteProject={deleteProject}
            />
          )}
          {activeTab === 'add-project' && (
            <ProjectForm 
              addProject={saveProject} 
              onCancel={() => { setActiveTab('projects'); setEditingProject(null); }}
              initialProject={editingProject || undefined}
            />
          )}
          {activeTab === 'lead-times' && (
            <LeadTimeManager 
              leadTimes={leadTimes} 
              updateLeadTime={updateLeadTime} 
            />
          )}
          {activeTab === 'dashboard' && (
            <Dashboard projects={projects} allLeadTimes={leadTimes} />
          )}
          {activeTab === 'calendar' && (
            <ProjectCalendar 
              projects={projects} 
              allLeadTimes={leadTimes} 
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
            />
          )}
          {activeTab === 'order-management' && (
            <OrderManagement 
              projects={projects} 
              setProjects={(updatedProjects) => {
                updatedProjects.forEach(saveProject);
              }} 
              allLeadTimes={leadTimes} 
              selectedProjectId={selectedProjectId === 'all' ? '' : selectedProjectId}
              setSelectedProjectId={(id) => setSelectedProjectId(id || 'all')}
            />
          )}
        </main>
      </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
