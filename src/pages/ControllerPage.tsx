import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Play, ArrowLeft, Folder } from 'lucide-react';
import { useSharedSignalR } from '../core/hooks/useSharedSignalR';
import { useProjectSync } from '../core/hooks/useProjectSync';
import { useProjectStore } from '../core/store/projectStore';
import { useNetworkStore } from '../core/store/networkStore';
import type { Project } from '../core/store/projectStore';
import type { SceneDefinition } from '../core/types/schema';

export const ControllerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { sendAction, isConnected, roomClients, getRoomClients } = useSharedSignalR();
  const { projects: displayProjects } = useProjectSync();
  const { deviceType } = useNetworkStore();
  const currentProjectId = useProjectStore((state: any) => state.currentProjectId);
  
  const [selectedProject, setSelectedProject] = useState<string | null>(currentProjectId);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      getRoomClients();
    }
  }, [isConnected, getRoomClients]);

  const screens = roomClients.filter(c => c.role === 'screen');
  
  const currentProject = displayProjects.find((p: Project) => p.id === selectedProject);
  const currentScene = currentProject?.scenes.find((s: SceneDefinition) => s.id === selectedScene);

  const [lastActionSent, setLastActionSent] = useState<string>('');

  const handleAction = async (actionType: string, payload?: any) => {
    if (!isConnected) {
      alert('⚠️ Non connecté au serveur');
      return;
    }
    if (screens.length === 0) {
      alert('⚠️ Aucun écran connecté. Veuillez connecter un écran d\'abord.');
      return;
    }
    setLastActionSent(actionType);
    await sendAction(actionType, payload);
    setTimeout(() => setLastActionSent(''), 1000);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/role-selector')}
            className="p-2 cine-button-muted rounded-lg transition-colors"
            title="Retour au sélecteur"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#b4975e]/15 text-[#d7bf8f] hover:bg-[#b4975e]/25"
              title="Gérer les projets"
            >
              <Folder size={20} />
              <span className="hidden sm:inline">Projets</span>
            </button>
            
            <div className={`px-4 py-2 rounded-full ${isConnected ? 'bg-emerald-900/40 text-emerald-300' : 'bg-rose-900/40 text-rose-300'}`}>
              {isConnected ? '● Connecté' : '○ Déconnecté'}
            </div>
          </div>
        </div>

        <div className="cine-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#d1b374] mb-2 flex items-center gap-3">
                Controller
              </h1>
              <p className="text-[#a9a49b]">
                Room: <span className="font-mono text-[#d1b374]">{roomId}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-[#8f8a81] text-sm capitalize">{deviceType}</div>
              <div className={`text-lg font-bold mt-1 ${screens.length > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {screens.length} écran{screens.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="max-w-2xl mx-auto space-y-4">
        {lastActionSent && (
          <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-lg p-3 text-emerald-200 text-sm text-center animate-pulse">
            ✅ Action envoyée : {lastActionSent}
          </div>
        )}

        {/* Project and Scene Selection */}
        {displayProjects.length > 0 && (
          <div className="cine-panel rounded-2xl p-6">
            <h3 className="text-[#ebe7df] font-semibold mb-3">Sélectionner une scène</h3>
            
            {/* Project Selector */}
            <select
              value={selectedProject || ''}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedScene(null);
              }}
              className="w-full mb-3 bg-black/25 border border-[#b4975e]/25 rounded-lg p-3 text-[#ebe7df]"
            >
              <option value="">-- Choisir un projet --</option>
              {displayProjects.map((project: Project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

            {/* Scene Selector */}
            {currentProject && (
              <>
                <select
                  value={selectedScene || ''}
                  onChange={(e) => setSelectedScene(e.target.value)}
                  className="w-full mb-3 bg-black/25 border border-[#b4975e]/25 rounded-lg p-3 text-[#ebe7df]"
                >
                  <option value="">-- Choisir une scène --</option>
                  {currentProject.scenes.map((scene: SceneDefinition) => (
                    <option key={scene.id} value={scene.id}>{scene.meta.sceneName}</option>
                  ))}
                </select>

                {/* Play Selected Scene */}
                {currentScene && (
                  <button
                    onClick={() => handleAction('PLAY_SCENE', { 
                      projectId: selectedProject, 
                      sceneId: selectedScene,
                      scene: currentScene
                    })}
                    className="w-full cine-button-primary p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    <Play size={24} />
                    <span>Lancer : {currentScene.meta.sceneName}</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* No Projects Fallback */}
        {displayProjects.length === 0 && (
          <div className="cine-panel rounded-2xl p-6 text-center">
            <p className="text-[#a9a49b] mb-4">
              {deviceType === 'mobile' ? 'En attente des projets du desktop...' : 'Aucun projet disponible'}
            </p>
            {deviceType === 'desktop' && (
              <button
                onClick={() => navigate('/projects')}
                className="px-6 py-3 cine-button-primary rounded-lg font-semibold"
              >
                Créer ou gérer des projets
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
