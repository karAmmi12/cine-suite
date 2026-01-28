import { useState } from 'react';
import { Plus, Film, Trash, Edit2, FolderOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../core/store/projectStore';

export const ProjectsListPage = () => {
  const navigate = useNavigate();
  const { projects, createProject, deleteProject, updateProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    
    const project = createProject(newProjectName.trim(), newProjectDesc.trim() || undefined);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
    navigate(`/project/${project.id}`);
  };

  const handleDelete = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length === 1) {
      alert('❌ Impossible de supprimer le dernier projet');
      return;
    }
    if (confirm('Supprimer ce projet et toutes ses scènes ?')) {
      deleteProject(projectId);
    }
  };

  const handleRename = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(projectId);
    const project = projects.find(p => p.id === projectId);
    setEditName(project?.name || '');
  };

  const saveRename = (projectId: string) => {
    if (editName.trim()) {
      updateProject(projectId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-black text-gray-100">
      {/* Header */}
      <header className="border-b border-amber-900/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif tracking-wide text-amber-500 mb-1 flex items-center gap-3">
                <Film className="text-amber-400" size={40} />
                CineSuite
              </h1>
              <p className="text-gray-500 text-sm tracking-widest uppercase">Production Dashboard</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 rounded font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg shadow-amber-900/50 text-black"
            >
              <Plus size={20} />
              Nouveau Projet
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-neutral-900/50 border border-amber-900/20 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <FolderOpen className="text-amber-500" size={20} />
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Projets</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{projects.length}</div>
          </div>
          
          <div className="bg-neutral-900/50 border border-amber-900/20 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <Film className="text-amber-500" size={20} />
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Scènes</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">
              {projects.reduce((sum, p) => sum + p.scenes.length, 0)}
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-amber-900/20 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-amber-500" size={20} />
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Récents</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">
              {projects.filter(p => {
                const daysSince = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                return daysSince <= 7;
              }).length}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-neutral-900/40 border border-amber-900/20 rounded-lg overflow-hidden hover:border-amber-700/40 transition-all cursor-pointer group hover:shadow-xl hover:shadow-amber-950/50"
            >
              {/* Thumbnail */}
              <div className="w-full h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border-b border-amber-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.05),transparent)]" />
                <Film size={64} className="text-amber-900/30 relative z-10" />
              </div>

              <div className="p-6">
                {/* Title */}
                {editingId === project.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveRename(project.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename(project.id)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="w-full bg-neutral-800 border border-amber-700/40 rounded px-3 py-2 font-semibold text-lg mb-3 outline-none focus:border-amber-600"
                  />
                ) : (
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-gray-100">{project.name}</h3>
                )}

                {/* Description */}
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {project.description || 'Aucune description'}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b border-amber-900/20">
                  <span>{project.scenes.length} scène{project.scenes.length > 1 ? 's' : ''}</span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleRename(project.id, e)}
                    className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-amber-900/20 py-2 rounded text-sm transition-colors"
                  >
                    <Edit2 size={14} />
                    Renommer
                  </button>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-950/50 hover:bg-red-950/70 border border-red-900/30 py-2 rounded text-sm transition-colors text-red-400"
                  >
                    <Trash size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-900/50 border border-amber-900/20 flex items-center justify-center">
              <Film size={48} className="text-amber-900/50" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-300">Aucun projet</h3>
            <p className="text-gray-600 mb-6">Créez votre premier projet pour commencer</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-3 rounded font-semibold hover:from-amber-700 hover:to-amber-800 transition-all text-black shadow-lg shadow-amber-900/50"
            >
              Créer un projet
            </button>
          </div>
        )}
      </main>

      {/* Modal Création */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-900/30 rounded-lg max-w-md w-full p-8 shadow-2xl shadow-black/50">
            <h2 className="text-2xl font-semibold mb-6 text-amber-500">Nouveau Projet</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Nom du projet *</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ex: Court métrage Zombies"
                  className="w-full bg-neutral-800 border border-amber-900/30 rounded px-4 py-3 outline-none focus:border-amber-600 transition-colors text-gray-100"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Description (optionnel)</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Ex: Histoire d'une apocalypse zombie en milieu urbain"
                  className="w-full bg-neutral-800 border border-amber-900/30 rounded px-4 py-3 outline-none focus:border-amber-600 transition-colors resize-none text-gray-100"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName('');
                  setNewProjectDesc('');
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-3 rounded font-medium transition-colors border border-amber-900/20"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!newProjectName.trim()}
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
