import { useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { downloadSceneConfig, readJsonFile } from '../utils/fileHandler';

/**
 * Hook partagé par tous les éditeurs de modules.
 * Consolide la logique d'export, import et preview commune aux 4 éditeurs.
 */
export const useEditorActions = () => {
  const currentScene = useProjectStore((state: any) => state.getCurrentScene());
  const updateCurrentScene = useProjectStore((state: any) => state.updateCurrentScene);
  const currentProjectId = useProjectStore((state: any) => state.currentProjectId);
  const currentSceneId = useProjectStore((state: any) => state.currentSceneId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const globalSettings = currentScene?.globalSettings;

  const updateGlobalSettings = (settings: any) => {
    updateCurrentScene({ globalSettings: settings });
  };

  const updateApiKey = (apiKey: string) => {
    updateCurrentScene({ globalSettings: { ...globalSettings, aiKey: apiKey } });
  };

  const handleExport = () => {
    if (currentScene) downloadSceneConfig(currentScene);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedScene = await readJsonFile(file);
      updateCurrentScene({ module: importedScene.module });
    } catch (err) {
      alert("Erreur lors de l'import : " + err);
    }
    e.target.value = '';
  };

  const openPreview = (width = 1280, height = 720) => {
    window.open(
      `/project/${currentProjectId}/scene/${currentSceneId}/play`,
      'CinePlayer',
      `popup=yes,width=${width},height=${height}`
    );
  };

  return {
    currentScene,
    updateCurrentScene,
    currentProjectId,
    currentSceneId,
    globalSettings,
    updateGlobalSettings,
    updateApiKey,
    fileInputRef,
    handleExport,
    handleImportClick,
    handleFileChange,
    openPreview,
  };
};
