import { useState } from 'react';
import { Plus, Film, Trash, Edit2, FolderOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../core/store/projectStore';
import type { Project } from '../core/store/projectStore';
import { useProjectSync } from '../core/hooks/useProjectSync';

const inputCls = 'w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.25)] rounded-lg px-4 py-3 text-sm text-[#ebe7df] placeholder-[#4a4840] outline-none focus:border-[#d1b374] transition-colors';

export const ProjectsListPage = () => {
  const navigate = useNavigate();
  const { createProject, deleteProject, updateProject } = useProjectStore();
  const { projects } = useProjectSync();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    const project = createProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || undefined,
      scenes: []
    });
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
    navigate(`/project/${project.id}`);
  };

  const handleDelete = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length === 1) { alert('Impossible de supprimer le dernier projet.'); return; }
    if (confirm('Supprimer ce projet et toutes ses scènes ?')) deleteProject(projectId);
  };

  const handleRename = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(projectId);
    const project = projects.find((p: Project) => p.id === projectId);
    setEditName(project?.name || '');
  };

  const saveRename = (projectId: string) => {
    if (editName.trim()) updateProject(projectId, { name: editName.trim() });
    setEditingId(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const totalScenes = projects.reduce((sum: number, p: Project) => sum + p.scenes.length, 0);
  const recentCount = projects.filter((p: Project) => {
    const days = (Date.now() - new Date(p.updatedAt).getTime()) / 86_400_000;
    return days <= 7;
  }).length;

  return (
    <div className="min-h-screen text-[#ebe7df] pb-24">

      {/* ─── Header ─── */}
      <header className="border-b border-[rgba(180,151,94,0.18)] bg-[#0d0f12]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif tracking-wide text-[#d1b374] flex items-center gap-3">
              <Film size={24} className="text-[#b4975e]" />
              CineSuite
            </h1>
            <p className="text-[#5a5862] text-[10px] tracking-widest uppercase mt-0.5">Production Dashboard</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 cine-button-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            <Plus size={16} /> Nouveau projet
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: FolderOpen, label: 'Projets',  value: projects.length },
            { icon: Film,       label: 'Scènes',   value: totalScenes },
            { icon: Clock,      label: 'Récents',  value: recentCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={15} className="text-[#b4975e]" />
                <span className="text-[10px] font-semibold text-[#5a5862] uppercase tracking-widest">{label}</span>
              </div>
              <div className="text-3xl font-bold text-[#d1b374]">{value}</div>
            </div>
          ))}
        </div>

        {/* ─── Projects grid ─── */}
        {projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#14161b] border border-[rgba(180,151,94,0.15)] flex items-center justify-center">
              <Film size={36} className="text-[#3a3830]" />
            </div>
            <h3 className="text-lg font-semibold text-[#a9a49b] mb-2">Aucun projet</h3>
            <p className="text-[#5a5862] text-sm mb-6">Créez votre premier projet pour commencer</p>
            <button onClick={() => setIsCreating(true)} className="cine-button-primary px-7 py-2.5 rounded-lg text-sm font-semibold">
              Créer un projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl overflow-hidden hover:border-[rgba(180,151,94,0.35)] transition-all cursor-pointer group hover:shadow-xl hover:shadow-black/40"
              >
                {/* Thumbnail */}
                <div className="w-full h-36 bg-[#0d0f12] flex items-center justify-center relative overflow-hidden border-b border-[rgba(180,151,94,0.1)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(180,151,94,0.06),transparent)]" />
                  <Film size={52} className="text-[#2a2820]" />
                </div>

                <div className="p-5">
                  {/* Title */}
                  {editingId === project.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveRename(project.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(project.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.3)] rounded px-3 py-1.5 font-semibold text-sm mb-3 outline-none focus:border-[#d1b374] text-[#ebe7df]"
                    />
                  ) : (
                    <h3 className="font-semibold text-[#ebe7df] mb-1.5 line-clamp-1">{project.name}</h3>
                  )}

                  <p className="text-[#5a5862] text-xs mb-4 line-clamp-2 min-h-[32px]">
                    {project.description || 'Aucune description'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#3a3830] mb-4 pb-4 border-b border-[rgba(180,151,94,0.08)]">
                    <span>{project.scenes.length} scène{project.scenes.length !== 1 ? 's' : ''}</span>
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>

                  {/* Actions — visible on hover */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleRename(project.id, e)}
                      className="flex-1 flex items-center justify-center gap-1.5 cine-button-muted py-2 rounded-lg text-xs font-medium"
                    >
                      <Edit2 size={12} /> Renommer
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[#dc6f6f] bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 transition-colors"
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
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[rgba(180,151,94,0.2)] rounded-2xl max-w-md w-full p-7 shadow-2xl">
            <h2 className="text-xl font-serif text-[#d1b374] mb-6">Nouveau projet</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Ex : Court métrage Zombies"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5">
                  Description (optionnel)
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Ex : Apocalypse zombie en milieu urbain"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => { setIsCreating(false); setNewProjectName(''); setNewProjectDesc(''); }}
                className="flex-1 cine-button-muted py-2.5 rounded-lg text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!newProjectName.trim()}
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
