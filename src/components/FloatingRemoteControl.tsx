import { useState, useEffect } from 'react';
import { Smartphone, X, Wifi, WifiOff, Send, Play, Folder, Loader2 } from 'lucide-react';
import { useSharedSignalR } from '../core/hooks/useSharedSignalR';
import { useLocation } from 'react-router-dom';
import type { Project } from '../core/store/projectStore';
import type { SceneDefinition } from '../core/types/schema';
import { isMobileDevice } from '../core/utils/deviceDetect';
import { getModuleIcon, getModuleTextColor } from '../core/utils/moduleHelpers';

export const FloatingRemoteControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [remoteProjects, setRemoteProjects] = useState<Project[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [hasRequested, setHasRequested] = useState(false);
  const [launchingScene, _setLaunchingScene] = useState<string | null>(null);
  const { isConnected, requestProjectsData, onReceiveProjects } = useSharedSignalR();
  const location = useLocation();
  const isMobile = isMobileDevice();

  const addDebug = (msg: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // Masquer sur desktop
  if (!isMobile) return null;

  // Recevoir les projets du Mac - Une seule fois au mount
  useEffect(() => {
    const handleProjects = (projectsJson: string) => {
      try {
        addDebug(`📦 Received ${projectsJson.length} chars`);
        const projects = JSON.parse(projectsJson);
        addDebug(`✅ Parsed ${projects.length} projects`);
        setRemoteProjects(projects);
      } catch (err) {
        addDebug(`❌ Parse error: ${err}`);
      }
    };

    onReceiveProjects(handleProjects);
    addDebug('🎧 Listening for projects');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Demander les projets du Mac au démarrage - UNE SEULE FOIS
  useEffect(() => {
    if (isConnected && !hasRequested) {
      addDebug('📥 Requesting projects...');
      const timer = setTimeout(() => {
        requestProjectsData();
        setHasRequested(true);
        addDebug('📤 Request sent');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, hasRequested]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async () => {
    // TODO: Implémenter avec le nouveau système
    addDebug('⚠️ sendMessage pas encore implémenté');
    setMessage('');
  };

  const handlePlayScene = async (projectId: string, sceneId: string) => {
    // TODO: Implémenter avec le nouveau système d'actions
    addDebug('⚠️ sendPlayCommand pas encore implémenté');
    console.log('▶️ Would send play command:', { projectId, sceneId });
  };
  
  const getModuleColor = getModuleTextColor;

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed bottom-6 right-6 z-50
            w-16 h-16 rounded-full shadow-2xl
            flex items-center justify-center
            transition-all duration-300 hover:scale-110
            ${isConnected ? 'bg-linear-to-br from-[#a88a52] to-[#cfb077]' : 'bg-gray-500'}
          `}
        >
          <Smartphone className="w-7 h-7 text-white" />
          {isConnected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Panel télécommande */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-linear-to-br from-[#0d0f14] via-[#151922] to-[#0d0f14] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto border-t border-[#b4975e]/25"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-[#d1b374]" />
                <h2 className="text-xl font-bold text-[#ebe7df]">Télécommande</h2>
              </div>
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 text-sm">Connecté</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">Déconnecté</span>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Liste des projets et scènes du Mac */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/70 mb-3">
                Projets sur le Mac ({remoteProjects.length})
              </h3>
              {remoteProjects.length === 0 ? (
                <div className="p-6 bg-white/10 rounded-xl text-center border border-[#b4975e]/20">
                  {isConnected ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-[#d1b374] animate-spin" />
                      <p className="text-white/70 text-sm">Chargement des projets...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <WifiOff className="w-8 h-8 text-red-400" />
                      <p className="text-white/70 text-sm">Connectez-vous pour voir les projets</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {remoteProjects.map((project) => (
                    <div key={project.id} className="bg-white/10 rounded-xl p-4 animate-fade-in border border-[#b4975e]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Folder className="w-5 h-5 text-[#d1b374]" />
                        <h4 className="text-white font-semibold">{project.name}</h4>
                        <span className="ml-auto text-xs text-white/50">{project.scenes.length} scène{project.scenes.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-2">
                        {project.scenes.map((scene: SceneDefinition) => {
                          const isLaunching = launchingScene === scene.id;
                          return (
                            <button
                              key={scene.id}
                              onClick={() => handlePlayScene(project.id, scene.id)}
                              disabled={!isConnected || isLaunching}
                              className={`
                                w-full flex items-center justify-between gap-3
                                p-3 rounded-lg text-white
                                transition-all duration-200
                                ${isLaunching 
                                  ? 'bg-green-500/30 scale-95' 
                                  : 'bg-black/25 hover:bg-white/15 active:scale-95'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <span className={getModuleColor(scene.module.type)}>
                                  {getModuleIcon(scene.module.type, 16)}
                                </span>
                                <span className="text-left">{scene.meta.sceneName}</span>
                              </div>
                              {isLaunching ? (
                                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Actions rapides</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setHasRequested(false);
                    requestProjectsData();
                    addDebug('🔄 Manual refresh');
                  }}
                  disabled={!isConnected}
                  className="
                    p-4 rounded-xl bg-[#b4975e]/20 text-[#ece4d4] font-medium border border-[#b4975e]/35
                    hover:bg-white/20 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>

            {/* Envoyer un message */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Envoyer un message</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Message pour l'écran principal..."
                  disabled={!isConnected}
                  className="
                    flex-1 px-4 py-3 rounded-xl
                    bg-white/15 text-white placeholder-white/45
                    border border-[#b4975e]/30
                    focus:outline-none focus:ring-2 focus:ring-[#b4975e]
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !message.trim()}
                  className="
                    px-6 py-3 rounded-xl
                    bg-[#b4975e] text-[#1f1a12] font-semibold
                    hover:bg-[#c8ab73] active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    flex items-center gap-2
                  "
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info page actuelle */}
            <div className="p-3 bg-[#b4975e]/15 rounded-xl border border-[#b4975e]/35 mb-4">
              <p className="text-[#ebd6ac] text-sm">
                📍 <strong>Page actuelle :</strong> {location.pathname}
              </p>
            </div>

            {/* Debug info */}
            <div className="p-3 bg-gray-800 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-400 mb-2">📊 Debug:</p>
              {debugInfo.map((info, i) => (
                <p key={i} className="text-xs text-gray-300 font-mono">{info}</p>
              ))}
              {debugInfo.length === 0 && (
                <p className="text-xs text-gray-500">Aucun événement</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
