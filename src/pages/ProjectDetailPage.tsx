import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Play, Edit, Trash, Copy, ArrowLeft, Search as SearchIcon, MessageCircle, Mail, Terminal as TerminalIcon } from 'lucide-react';
import { useProjectStore } from '../core/store/projectStore';
import type { SceneDefinition } from '../core/types/schema';

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProject, addScene, deleteScene, duplicateScene, setCurrentScene } = useProjectStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneType, setNewSceneType] = useState<'search' | 'chat' | 'mail' | 'terminal'>('search');

  const project = getProject(projectId!);

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Projet introuvable</h2>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  const handleCreateScene = () => {
    if (!newSceneName.trim()) return;

    const newScene: SceneDefinition = {
      id: `scene-${Date.now()}`,
      meta: {
        projectName: project.name,
        sceneName: newSceneName.trim(),
        createdAt: new Date().toISOString()
      },
      globalSettings: { themeId: 'light', zoomLevel: 1 },
      module: createDefaultModule(newSceneType)
    };

    addScene(projectId!, newScene);
    setShowCreateModal(false);
    setNewSceneName('');
    navigate(`/project/${projectId}/scene/${newScene.id}/edit`);
  };

  const handlePlayScene = (sceneId: string) => {
    setCurrentScene(projectId!, sceneId);
    navigate(`/project/${projectId}/scene/${sceneId}/play`);
  };

  const handleEditScene = (sceneId: string) => {
    setCurrentScene(projectId!, sceneId);
    navigate(`/project/${projectId}/scene/${sceneId}/edit`);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (confirm('Supprimer cette scène ?')) {
      deleteScene(projectId!, sceneId);
    }
  };

  const handleDuplicateScene = (sceneId: string) => {
    duplicateScene(projectId!, sceneId);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'search': return <SearchIcon size={20} />;
      case 'chat': return <MessageCircle size={20} />;
      case 'mail': return <Mail size={20} />;
      case 'terminal': return <TerminalIcon size={20} />;
      default: return <SearchIcon size={20} />;
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'search': return 'from-blue-600 to-cyan-600';
      case 'chat': return 'from-green-600 to-emerald-600';
      case 'mail': return 'from-red-600 to-pink-600';
      case 'terminal': return 'from-amber-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-black text-gray-100">
      {/* Header */}
      <header className="border-b border-amber-900/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 hover:bg-neutral-800 rounded transition-colors border border-amber-900/20"
              >
                <ArrowLeft size={24} className="text-amber-500" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-amber-500">{project.name}</h1>
                <p className="text-gray-600 text-sm mt-1">
                  {project.description || 'Aucune description'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 rounded font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg shadow-amber-900/50 text-black"
            >
              <Plus size={20} />
              Nouvelle Scène
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Scenes Grid */}
        {project.scenes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-neutral-900/40 border border-amber-900/20 rounded-lg overflow-hidden group hover:border-amber-700/40 hover:shadow-xl hover:shadow-amber-950/50 transition-all"
              >
                {/* Header coloré selon le type */}
                <div className={`bg-gradient-to-r ${getModuleColor(scene.module.type)} p-4 flex items-center gap-3 border-b border-black/20`}>
                  {getModuleIcon(scene.module.type)}
                  <span className="font-semibold uppercase text-xs tracking-wider">
                    {scene.module.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-gray-100">{scene.meta.sceneName}</h3>
                  
                  <p className="text-gray-600 text-xs mb-4">
                    Créée le {formatDate(scene.meta.createdAt)}
                  </p>

                  {/* Quick Info */}
                  <div className="bg-neutral-800/50 border border-amber-900/20 rounded p-3 mb-4 text-xs text-gray-400">
                    {scene.module.type === 'search' && `${(scene.module as any).results?.length || 0} résultats`}
                    {scene.module.type === 'chat' && `${(scene.module as any).messagesHistory?.length || 0} messages`}
                    {scene.module.type === 'mail' && `${(scene.module as any).emails?.length || 0} emails`}
                    {scene.module.type === 'terminal' && `${(scene.module as any).lines?.length || 0} lignes`}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlayScene(scene.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-950/50 hover:bg-green-950/70 border border-green-900/40 py-2 rounded font-medium transition-colors text-green-400 text-sm"
                    >
                      <Play size={16} />
                      Lancer
                    </button>
                    <button
                      onClick={() => handleEditScene(scene.id)}
                      className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-amber-900/20 px-4 py-2 rounded transition-colors text-sm"
                    >
                      <Edit size={16} />
                    </button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicateScene(scene.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-amber-900/20 py-2 rounded text-xs transition-colors"
                    >
                      <Copy size={14} />
                      Dupliquer
                    </button>
                    <button
                      onClick={() => handleDeleteScene(scene.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-950/50 hover:bg-red-950/70 border border-red-900/30 py-2 rounded text-xs transition-colors text-red-400"
                    >
                      <Trash size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20">
            <div className="bg-neutral-900/50 border border-amber-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Play size={48} className="text-amber-900/50" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-300">Aucune scène</h3>
            <p className="text-gray-600 mb-6">Créez votre première scène pour commencer</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-3 rounded font-semibold hover:from-amber-700 hover:to-amber-800 transition-all text-black shadow-lg shadow-amber-900/50"
            >
              Créer une scène
            </button>
          </div>
        )}
      </main>

      {/* Modal Création Scène */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-900/30 rounded-lg max-w-md w-full p-8 shadow-2xl shadow-black/50">
            <h2 className="text-2xl font-semibold mb-6 text-amber-500">Nouvelle Scène</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Nom de la scène *</label>
                <input
                  type="text"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  placeholder="Ex: Hack du FBI"
                  className="w-full bg-neutral-800 border border-amber-900/30 rounded px-4 py-3 outline-none focus:border-amber-600 transition-colors text-gray-100"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Type de module</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'search' as const, label: 'Recherche', icon: SearchIcon, color: 'amber-600' },
                    { type: 'chat' as const, label: 'Chat', icon: MessageCircle, color: 'green-600' },
                    { type: 'mail' as const, label: 'Email', icon: Mail, color: 'red-600' },
                    { type: 'terminal' as const, label: 'Terminal', icon: TerminalIcon, color: 'orange-600' }
                  ].map(({ type, label, icon: Icon, color }) => (
                    <button
                      key={type}
                      onClick={() => setNewSceneType(type)}
                      className={`flex items-center gap-3 p-4 rounded border transition-all ${
                        newSceneType === type
                          ? `border-${color} bg-${color}/10`
                          : 'border-amber-900/20 bg-neutral-800 hover:bg-neutral-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSceneName('');
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-3 rounded font-medium transition-colors border border-amber-900/20"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateScene}
                disabled={!newSceneName.trim()}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-black shadow-lg shadow-amber-900/50"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper pour créer le module par défaut selon le type
function createDefaultModule(type: 'search' | 'chat' | 'mail' | 'terminal'): any {
  switch (type) {
    case 'search':
      return { type: 'search', brandName: 'Seeker', triggerText: '', results: [] };
    case 'chat':
      return { type: 'chat', contactName: 'Contact', triggerText: '', messagesHistory: [], messageToType: '' };
    case 'mail':
      return { type: 'mail', userEmail: 'user@example.com', triggerText: '', emails: [] };
    case 'terminal':
      return { 
        type: 'terminal', 
        triggerText: 'init.sh', 
        lines: ['Initializing...'], 
        color: 'green',
        typingSpeed: 'fast',
        showProgressBar: false,
        finalMessage: 'Complete',
        finalStatus: 'success'
      };
  }
}
