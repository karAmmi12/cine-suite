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
  id: 'demo-chat',
  meta: { projectName: 'Demo', sceneName: 'Séquence SMS Rupture', createdAt: new Date().toISOString() },
  globalSettings: { themeId: 'light', zoomLevel: 1 },
  module: {
    type: 'chat',
    triggerText: "Je sais ce que tu as fait hier soir...", // C'est ce texte qui sera utilisé par le Magic Typing
    contactName: "Sarah",
    messageToType: "Je sais ce que tu as fait hier soir...",
    messagesHistory: [
      { id: '1', isMe: false, text: "Tu rentres à quelle heure ?", time: "19:30" },
      { id: '2', isMe: true, text: "Pas tard, je finis le dossier.", time: "19:32", status: 'read' },
      { id: '3', isMe: false, text: "Menteur.", time: "23:45" },
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