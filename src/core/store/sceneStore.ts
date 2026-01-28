import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SceneDefinition } from '../types/schema';

interface SceneState {
  currentScene: SceneDefinition | null;
  loadScene: (scene: SceneDefinition) => void;
  updateScene: (partialScene: Partial<SceneDefinition>) => void;
  resetScene: () => void;
}

const defaultScene: SceneDefinition = {
id: 'demo-mail',
  meta: { projectName: 'Demo', sceneName: 'Emails Confidentiels', createdAt: new Date().toISOString() },
  globalSettings: { themeId: 'light', zoomLevel: 1 },
  module: {
    type: 'mail',
    triggerText: "Je démissionne immédiatement.", // Texte Magic Typing pour un nouveau mail
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
      },
      {
        id: '2',
        folder: 'inbox',
        read: true,
        senderName: "Maman",
        senderEmail: "maman@gmail.com",
        subject: "Repas de dimanche",
        preview: "N'oublie pas d'apporter le dessert.",
        body: "Coucou mon chéri,\n\nTu viens toujours dimanche ? Ton père a préparé le jardin.\n\nBisous.",
        date: "Hier"
      }
    ]
  }
};

// On enveloppe notre store avec "persist"
export const useSceneStore = create<SceneState>()(
  persist(
    (set) => ({
      currentScene: defaultScene,
      
      loadScene: (scene) => set({ currentScene: scene }),
      
      updateScene: (updates) => set((state) => ({
        currentScene: state.currentScene ? { ...state.currentScene, ...updates } : null
      })),
      
      resetScene: () => set({ currentScene: defaultScene })
    }),
    {
      name: 'cine-suite-storage', // Le nom de la clé dans le LocalStorage
      storage: createJSONStorage(() => localStorage), // On utilise le stockage local du navigateur
    }
  )
);