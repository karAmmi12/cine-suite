import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SceneDefinition } from '../types/schema';
import { createDefaultProject } from '../../data/demoProjectData';

export interface Project {
  id: string;
  name: string;
  description?: string;
  scenes: SceneDefinition[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  currentSceneId: string | null;
  
  // Actions
  setCurrentProject: (projectId: string) => void;
  setCurrentScene: (sceneId: string) => void;
  getCurrentScene: () => SceneDefinition | null;
  getProject: (projectId: string) => Project | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  addScene: (projectId: string, scene: SceneDefinition) => void;
  updateScene: (projectId: string, sceneId: string, updates: Partial<SceneDefinition>) => void;
  updateCurrentScene: (updates: Partial<SceneDefinition>) => void;
  deleteScene: (projectId: string, sceneId: string) => void;
  duplicateScene: (projectId: string, sceneId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [createDefaultProject()],
      currentProjectId: 'demo-project',
      currentSceneId: 'demo-mail',

      setCurrentProject: (projectId: string) => {
        set({ currentProjectId: projectId });
      },

      setCurrentScene: (sceneId: string) => {
        set({ currentSceneId: sceneId });
      },

      getCurrentScene: () => {
        const state = get();
        const project = state.projects.find(p => p.id === state.currentProjectId);
        if (!project) return null;
        return project.scenes.find(s => s.id === state.currentSceneId) || null;
      },

      getProject: (projectId: string) => {
        const state = get();
        return state.projects.find(p => p.id === projectId) || null;
      },

      createProject: (project) => {
        const newProject: Project = {
          ...project,
          id: `project-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set(state => ({
          projects: [...state.projects, newProject]
        }));
        return newProject;
      },

      addProject: (project: Project) => {
        set(state => ({
          projects: [...state.projects, project]
        }));
      },

      updateProject: (projectId: string, updates: Partial<Project>) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          )
        }));
      },

      deleteProject: (projectId: string) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
        }));
      },

      addScene: (projectId: string, scene: SceneDefinition) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId
              ? { ...p, scenes: [...p.scenes, scene], updatedAt: new Date().toISOString() }
              : p
          )
        }));
      },

      updateScene: (projectId: string, sceneId: string, updates: Partial<SceneDefinition>) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId
              ? {
                  ...p,
                  scenes: p.scenes.map(s => 
                    s.id === sceneId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }));
      },

      updateCurrentScene: (updates: Partial<SceneDefinition>) => {
        const state = get();
        if (!state.currentProjectId || !state.currentSceneId) return;
        
        set({
          projects: state.projects.map(p => 
            p.id === state.currentProjectId
              ? {
                  ...p,
                  scenes: p.scenes.map(s => 
                    s.id === state.currentSceneId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        });
      },

      deleteScene: (projectId: string, sceneId: string) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId
              ? {
                  ...p,
                  scenes: p.scenes.filter(s => s.id !== sceneId),
                  updatedAt: new Date().toISOString()
                }
              : p
          ),
          currentSceneId: state.currentSceneId === sceneId ? null : state.currentSceneId
        }));
      },

      duplicateScene: (projectId: string, sceneId: string) => {
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const sceneToClone = project.scenes.find(s => s.id === sceneId);
        if (!sceneToClone) return;
        
        const newScene: SceneDefinition = {
          ...sceneToClone,
          id: `scene-${Date.now()}`,
          meta: {
            ...sceneToClone.meta,
            sceneName: `${sceneToClone.meta.sceneName} (copie)`,
            createdAt: new Date().toISOString()
          }
        };
        
        set({
          projects: state.projects.map(p => 
            p.id === projectId
              ? {
                  ...p,
                  scenes: [...p.scenes, newScene],
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        });
      }
    }),
    {
      name: 'cinesuite-projects',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
