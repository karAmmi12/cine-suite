/**
 * 🎬 PROJECT STORE - Gestion multi-projets/multi-scènes
 * Architecture commerciale : Dashboard → Projets → Scènes
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SceneDefinition } from '../types/schema';
import { Encryption } from '../security/encryption';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // URL image preview
  scenes: SceneDefinition[];
}

interface ProjectState {
  // State
  projects: Project[];
  currentProjectId: string | null;
  currentSceneId: string | null;
  
  // Projects CRUD
  createProject: (name: string, description?: string) => Project;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id' | 'scenes'>>) => void;
  setCurrentProject: (projectId: string) => void;
  
  // Scenes CRUD
  addScene: (projectId: string, scene: SceneDefinition) => void;
  updateScene: (projectId: string, sceneId: string, updates: Partial<SceneDefinition>) => void;
  updateCurrentScene: (updates: Partial<SceneDefinition>) => void; // Mise à jour scène courante
  deleteScene: (projectId: string, sceneId: string) => void;
  duplicateScene: (projectId: string, sceneId: string) => void;
  setCurrentScene: (projectId: string, sceneId: string) => void;
  
  // Getters
  getCurrentProject: () => Project | null;
  getCurrentScene: () => SceneDefinition | null;
  getProject: (projectId: string) => Project | undefined;
}

// Projet par défaut pour les nouveaux utilisateurs
const createDefaultProject = (): Project => ({
  id: 'demo-project',
  name: 'Projet Démo',
  description: 'Découvrez CineSuite avec ce projet exemple',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      id: 'demo-mail',
      meta: { 
        projectName: 'Projet Démo', 
        sceneName: 'Emails Confidentiels', 
        createdAt: new Date().toISOString() 
      },
      globalSettings: { themeId: 'light', zoomLevel: 1 },
      module: {
        type: 'mail',
        triggerText: "Je démissionne immédiatement.",
        userEmail: "thomas.anderson@metacortex.com",
        emails: [
          {
            id: '1',
            folder: 'inbox',
            read: false,
            senderName: "Directeur RH",
            senderEmail: "hr@metacortex.com",
            subject: "Convocation urgente",
            preview: "Monsieur Anderson, merci de passer à mon bureau...",
            body: "Monsieur Anderson,\n\nNous avons relevé des irrégularités dans vos horaires.\nMerci de passer à mon bureau immédiatement.\n\nCordialement,\nLa Direction.",
            date: "10:42"
          }
        ]
      }
    }
  ]
});

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [createDefaultProject()],
      currentProjectId: 'demo-project',
      currentSceneId: 'demo-mail',
      
      // === PROJECTS ===
      
      createProject: (name, description) => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scenes: []
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id,
          currentSceneId: null
        }));
        
        return newProject;
      },
      
      deleteProject: (projectId) => {
        set((state) => {
          const filtered = state.projects.filter(p => p.id !== projectId);
          return {
            projects: filtered,
            currentProjectId: state.currentProjectId === projectId 
              ? (filtered[0]?.id || null) 
              : state.currentProjectId,
            currentSceneId: state.currentProjectId === projectId ? null : state.currentSceneId
          };
        });
      },
      
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, ...updates, updatedAt: new Date().toISOString() } 
              : p
          )
        }));
      },
      
      setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId, currentSceneId: null });
      },
      
      // === SCENES ===
      
      addScene: (projectId, scene) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { 
                  ...p, 
                  scenes: [...p.scenes, scene],
                  updatedAt: new Date().toISOString()
                } 
              : p
          ),
          currentSceneId: scene.id
        }));
      },
      
      updateScene: (projectId, sceneId, updates) => {
        set((state) => ({
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
      
      // Mise à jour simplifiée de la scène courante (pour les éditeurs)
      updateCurrentScene: (updates) => {
        const { currentProjectId, currentSceneId } = get();
        if (!currentProjectId || !currentSceneId) return;
        
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === currentProjectId 
              ? {
                  ...p,
                  scenes: p.scenes.map(s => 
                    s.id === currentSceneId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }));
      },
      
      deleteScene: (projectId, sceneId) => {
        set((state) => ({
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
      
      duplicateScene: (projectId, sceneId) => {
        set((state) => ({
          projects: state.projects.map(p => {
            if (p.id !== projectId) return p;
            
            const scene = p.scenes.find(s => s.id === sceneId);
            if (!scene) return p;
            
            const duplicate: SceneDefinition = {
              ...scene,
              id: `scene-${Date.now()}`,
              meta: {
                ...scene.meta,
                sceneName: `${scene.meta.sceneName} (copie)`,
                createdAt: new Date().toISOString()
              }
            };
            
            return {
              ...p,
              scenes: [...p.scenes, duplicate],
              updatedAt: new Date().toISOString()
            };
          })
        }));
      },
      
      setCurrentScene: (projectId, sceneId) => {
        set({ currentProjectId: projectId, currentSceneId: sceneId });
      },
      
      // === GETTERS ===
      
      getCurrentProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.currentProjectId) || null;
      },
      
      getCurrentScene: () => {
        const state = get();
        const project = state.projects.find(p => p.id === state.currentProjectId);
        if (!project) return null;
        return project.scenes.find(s => s.id === state.currentSceneId) || null;
      },
      
      getProject: (projectId) => {
        return get().projects.find(p => p.id === projectId);
      }
    }),
    {
      name: 'cinesuite-projects',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          
          // Déchiffre les données en production
          if (import.meta.env.PROD) {
            try {
              return await Encryption.decrypt(item);
            } catch {
              return item; // Fallback si déchiffrement échoue
            }
          }
          return item;
        },
        setItem: async (name, value) => {
          // Chiffre les données en production
          if (import.meta.env.PROD) {
            try {
              const encrypted = await Encryption.encrypt(value);
              localStorage.setItem(name, encrypted);
              return;
            } catch {
              // Fallback si chiffrement échoue
            }
          }
          localStorage.setItem(name, value);
        },
        removeItem: async (name) => {
          localStorage.removeItem(name);
        }
      })),
    }
  )
);
