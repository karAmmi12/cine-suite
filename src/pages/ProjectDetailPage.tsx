import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Play, Edit, Trash, Copy, ArrowLeft } from 'lucide-react';
import { useProjectStore } from '../core/store/projectStore';
import type { Project } from '../core/store/projectStore';
import type { SceneDefinition } from '../core/types/schema';
import { useProjectSync } from '../core/hooks/useProjectSync';
import { getModuleIcon, getModuleGradient } from '../core/utils/moduleHelpers';

const inputCls = 'w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.25)] rounded-lg px-4 py-3 text-sm text-[#ebe7df] placeholder-[#4a4840] outline-none focus:border-[#d1b374] transition-colors';

// Helper: default module config par type
function createDefaultModule(type: 'search' | 'chat' | 'mail' | 'terminal'): any {
  switch (type) {
    case 'search':
      return { type: 'search', brandName: 'Seeker', triggerText: '', results: [], theme: 'modern' };
    case 'chat':
      return { type: 'chat', contactName: 'Contact', triggerText: '', messagesHistory: [], messageToType: '' };
    case 'mail':
      return { type: 'mail', userEmail: 'user@example.com', triggerText: '', emails: [] };
    case 'terminal':
      return {
        type: 'terminal',
        triggerText: 'init.sh',
        lines: ['Initializing system...', 'Loading modules...', 'Ready.'],
        color: 'green',
        typingSpeed: 'fast',
        showProgressBar: false,
        progressDuration: 5,
        finalMessage: 'Complete',
        finalStatus: 'success'
      };
  }
}

const MODULE_TYPES = [
  { type: 'search'   as const, label: 'Recherche',  desc: 'Moteur de recherche, enquête' },
  { type: 'chat'     as const, label: 'Chat',        desc: 'SMS, messagerie instantanée' },
  { type: 'mail'     as const, label: 'Email',       desc: 'Boîte mail, messagerie' },
  { type: 'terminal' as const, label: 'Terminal',    desc: 'Console, hacking, logs' },
] as const;

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProject, addScene, deleteScene, duplicateScene, setCurrentProject, setCurrentScene } = useProjectStore();
  const { projects: syncedProjects, isMobile, isLoadingRemote } = useProjectSync();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneType, setNewSceneType] = useState<'search' | 'chat' | 'mail' | 'terminal'>('search');

  const project = isMobile
    ? syncedProjects.find((p: Project) => p.id === projectId)
    : getProject(projectId!);

  if (isMobile && isLoadingRemote) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#ebe7df]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#d1b374] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a9a49b] text-sm">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#ebe7df]">
        <div className="text-center">
          <p className="text-[#a9a49b] mb-4">Projet introuvable</p>
          <button
            onClick={() => navigate('/projects')}
            className="cine-button-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            ← Retour aux projets
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
    setCurrentProject(projectId!);
    setCurrentScene(newScene.id);
    setShowCreateModal(false);
    setNewSceneName('');
    navigate(`/project/${projectId}/scene/${newScene.id}/edit`);
  };

  const handlePlayScene = (sceneId: string) => {
    setCurrentProject(projectId!);
    setCurrentScene(sceneId);
    navigate(`/project/${projectId}/scene/${sceneId}/play`);
  };

  const handleEditScene = (sceneId: string) => {
    setCurrentProject(projectId!);
    setCurrentScene(sceneId);
    navigate(`/project/${projectId}/scene/${sceneId}/edit`);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (confirm('Supprimer cette scène ?')) deleteScene(projectId!, sceneId);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const getSceneCount = (scene: SceneDefinition): string => {
    const m = scene.module as any;
    switch (scene.module.type) {
      case 'search':   return `${m.results?.length || 0} résultat${m.results?.length !== 1 ? 's' : ''}`;
      case 'chat':     return `${m.messagesHistory?.length || 0} message${m.messagesHistory?.length !== 1 ? 's' : ''}`;
      case 'mail':     return `${m.emails?.length || 0} email${m.emails?.length !== 1 ? 's' : ''}`;
      case 'terminal': return `${m.lines?.length || 0} ligne${m.lines?.length !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen text-[#ebe7df] pb-24">

      {/* ─── Header ─── */}
      <header className="border-b border-[rgba(180,151,94,0.18)] bg-[#0d0f12]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 hover:bg-[#1c1f26] rounded-lg transition-colors border border-[rgba(180,151,94,0.15)] shrink-0"
            >
              <ArrowLeft size={18} className="text-[#b4975e]" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[#d1b374] truncate">{project.name}</h1>
              {project.description && (
                <p className="text-[#5a5862] text-xs truncate">{project.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 cine-button-primary px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0"
          >
            <Plus size={16} /> Nouvelle scène
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {project.scenes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#14161b] border border-[rgba(180,151,94,0.15)] flex items-center justify-center">
              <Play size={32} className="text-[#3a3830]" />
            </div>
            <h3 className="text-lg font-semibold text-[#a9a49b] mb-2">Aucune scène</h3>
            <p className="text-[#5a5862] text-sm mb-6">Créez votre première scène pour commencer</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="cine-button-primary px-7 py-2.5 rounded-lg text-sm font-semibold"
            >
              Créer une scène
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {project.scenes.map((scene: SceneDefinition) => (
              <div
                key={scene.id}
                className="bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl overflow-hidden group hover:border-[rgba(180,151,94,0.3)] hover:shadow-xl hover:shadow-black/40 transition-all"
              >
                {/* Module type header */}
                <div className={`bg-linear-to-r ${getModuleGradient(scene.module.type)} px-4 py-3 flex items-center gap-2.5 border-b border-black/20`}>
                  {getModuleIcon(scene.module.type)}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {scene.module.type}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-[#ebe7df] mb-1 line-clamp-1">{scene.meta.sceneName}</h3>
                  <p className="text-[#3a3830] text-[11px] mb-4">{formatDate(scene.meta.createdAt)}</p>

                  {/* Stats */}
                  <div className="bg-[#0d0f12] border border-[rgba(180,151,94,0.08)] rounded-lg px-3 py-2 mb-4 text-xs text-[#5a5862]">
                    {getSceneCount(scene)}
                  </div>

                  {/* Primary actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlayScene(scene.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/30 py-2 rounded-lg font-medium text-emerald-400 text-xs transition-colors"
                    >
                      <Play size={14} /> Lancer
                    </button>
                    <button
                      onClick={() => handleEditScene(scene.id)}
                      className="flex items-center justify-center gap-1.5 cine-button-muted px-4 py-2 rounded-lg text-xs"
                    >
                      <Edit size={14} />
                    </button>
                  </div>

                  {/* Secondary actions — on hover */}
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateScene(projectId!, scene.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 cine-button-muted py-1.5 rounded-lg text-xs font-medium"
                    >
                      <Copy size={12} /> Dupliquer
                    </button>
                    <button
                      onClick={() => handleDeleteScene(scene.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-[#dc6f6f] bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 transition-colors"
                    >
                      <Trash size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── Modal création ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[rgba(180,151,94,0.2)] rounded-2xl max-w-md w-full p-7 shadow-2xl">
            <h2 className="text-xl font-serif text-[#d1b374] mb-6">Nouvelle scène</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateScene()}
                  placeholder="Ex : Hack du FBI, Séquence SMS..."
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-2">
                  Type de module
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {MODULE_TYPES.map(({ type, label, desc }) => (
                    <button
                      key={type}
                      onClick={() => setNewSceneType(type)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        newSceneType === type
                          ? 'border-[#d1b374] bg-[rgba(180,151,94,0.1)]'
                          : 'border-[rgba(180,151,94,0.15)] bg-[#1c1f26] hover:border-[rgba(180,151,94,0.3)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getModuleIcon(type)}
                        <span className="font-semibold text-sm text-[#ebe7df]">{label}</span>
                      </div>
                      <p className="text-[10px] text-[#5a5862]">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => { setShowCreateModal(false); setNewSceneName(''); }}
                className="flex-1 cine-button-muted py-2.5 rounded-lg text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateScene}
                disabled={!newSceneName.trim()}
                className="flex-1 cine-button-primary py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
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
