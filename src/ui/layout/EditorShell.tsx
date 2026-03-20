import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeft, Download, Upload, Play,
  Key, Wand2, Settings, Search, MessageCircle, Mail, Terminal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditorActions } from '../../core/hooks/useEditorActions';
import { useProjectStore } from '../../core/store/projectStore';
import { CineAssistant } from '../../components/CineAssistant';
import { GlobalSettings } from '../../components/GlobalSettings';
import type { ModuleType } from '../../core/types/schema';

// --- Module meta ---
const MODULE_META: Record<ModuleType, { label: string; icon: ReactNode; badge: string }> = {
  search:   { label: 'Recherche',  icon: <Search   size={13} />, badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  chat:     { label: 'Chat',       icon: <MessageCircle size={13} />, badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  mail:     { label: 'Email',      icon: <Mail     size={13} />, badge: 'bg-red-500/15 text-red-300 border-red-500/30' },
  terminal: { label: 'Terminal',   icon: <Terminal size={13} />, badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
};

interface EditorShellProps {
  children: ReactNode;
}

export const EditorShell = ({ children }: EditorShellProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    currentScene,
    currentSceneId,
    currentProjectId,
    globalSettings,
    updateCurrentScene,
    fileInputRef,
    handleExport,
    handleImportClick,
    handleFileChange,
  } = useEditorActions();

  const projects = useProjectStore((s: any) => s.projects);
  const project = projects.find((p: any) => p.id === currentProjectId);

  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!currentScene) return null;

  const moduleType = currentScene.module.type as ModuleType;
  const meta = MODULE_META[moduleType];

  const handlePreview = () => {
    if (currentProjectId && currentSceneId) {
      navigate(`/project/${currentProjectId}/scene/${currentSceneId}/play`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d0f12] text-[#ebe7df] overflow-hidden">

      {/* ─── Top Bar ─── */}
      <header className="flex-none h-11 flex items-center gap-3 px-4 border-b border-[rgba(180,151,94,0.18)] bg-[#0d0f12]/95 backdrop-blur-md z-20">

        {/* Left: back + breadcrumb */}
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="flex items-center gap-2 text-[#a9a49b] hover:text-[#ebe7df] transition-colors shrink-0 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-medium truncate max-w-[120px]">
            {project?.name || 'Projet'}
          </span>
        </button>

        <span className="text-[#3a3830] text-xs">›</span>

        <span className="text-xs text-[#ebe7df]/70 truncate max-w-[180px]">
          {currentScene.meta.sceneName}
        </span>

        {/* Module badge */}
        <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${meta.badge} shrink-0`}>
          {meta.icon}
          {meta.label}
        </span>

        <div className="flex-1" />

        {/* Right: tools */}
        <div className="flex items-center gap-1.5">

          {/* API Key */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowKeyInput(v => !v)}
              title="Clé API Groq"
              className={`p-1.5 rounded transition-colors ${showKeyInput || globalSettings?.aiKey ? 'text-[#d1b374]' : 'text-[#5a5862] hover:text-[#a9a49b]'}`}
            >
              <Key size={14} />
            </button>
            {showKeyInput && (
              <input
                type="password"
                placeholder="Clé Groq..."
                value={globalSettings?.aiKey || ''}
                onChange={(e) => updateCurrentScene({ globalSettings: { ...globalSettings, aiKey: e.target.value } })}
                autoFocus
                className="w-44 bg-[#1c1f26] border border-[rgba(180,151,94,0.3)] rounded px-2 py-1 text-xs text-[#ebe7df] placeholder-[#5a5862] outline-none focus:border-[#d1b374] transition-colors"
              />
            )}
          </div>

          <div className="w-px h-4 bg-[#2a2826]" />

          {/* Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            title="Importer JSON"
            className="p-1.5 text-[#5a5862] hover:text-[#a9a49b] rounded transition-colors"
          >
            <Upload size={14} />
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            title="Exporter JSON"
            className="p-1.5 text-[#5a5862] hover:text-[#a9a49b] rounded transition-colors"
          >
            <Download size={14} />
          </button>

          <div className="w-px h-4 bg-[#2a2826]" />

          {/* Preview */}
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 cine-button-primary px-3 py-1.5 rounded text-xs font-semibold"
          >
            <Play size={12} />
            Lancer
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* ─── Floating Actions ─── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        <button
          onClick={() => setShowSettings(true)}
          title="Paramètres de scène"
          className="p-3 cine-button-muted rounded-full shadow-xl transition-all hover:scale-105"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={() => setShowAssistant(true)}
          title="Assistant IA Cinéma"
          className="p-4 cine-button-primary rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <Wand2 size={22} />
        </button>
      </div>

      {/* ─── Modals ─── */}
      {showAssistant && <CineAssistant onClose={() => setShowAssistant(false)} />}
      {showSettings  && <GlobalSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
};
