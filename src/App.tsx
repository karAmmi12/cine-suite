import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { SearchModule } from './modules/search/SearchModule';
import { SearchEditor } from './modules/search/editor/SearchEditor';
import { ChatModule } from './modules/chat/ChatModule';
import { ChatEditor } from './modules/chat/editor/ChatEditor';
import { MailModule } from './modules/mail/MailModule';
import { MailEditor } from './modules/mail/editor/MailEditor';
import { TerminalModule } from './modules/terminal/TerminalModule';
import { TerminalEditor } from './modules/terminal/editor/TerminalEditor';
import { useProjectStore } from './core/store/projectStore';
import type { Project } from './core/store/projectStore';
import type { SceneDefinition, SearchModuleConfig, MailModuleConfig } from './core/types/schema';
import { BrowserFrame } from './ui/layout/BrowserFrame';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { NetworkStatus } from './components/NetworkStatus';
import { FloatingRemoteControl } from './components/FloatingRemoteControl';
import { RoleSelector } from './components/RoleSelector';
import { ControllerPage } from './pages/ControllerPage';
import { ScreenPage } from './pages/ScreenPage';
import { useNetworkStore } from './core/store/networkStore';

// --- Watermark freemium ---
const isPro = false; // TODO: système de licence

// --- PLAYER ---
function Player() {
  const { projectId, sceneId } = useParams<{ projectId: string; sceneId: string }>();
  const projects = useProjectStore((state: any) => state.projects);
  const project = projects.find((p: Project) => p.id === projectId);
  const currentScene = project?.scenes.find((s: SceneDefinition) => s.id === sceneId);

  if (!currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f12] text-[#ebe7df]">
        <div className="text-center">
          <p className="text-[#a9a49b] mb-4">Aucune scène sélectionnée</p>
          <a href="#/projects" className="text-[#d1b374] hover:underline text-sm">
            ← Retour aux projets
          </a>
        </div>
      </div>
    );
  }

  const module = currentScene.module;
  const isDark = currentScene.globalSettings?.themeId === 'dark';

  const getFakeUrl = (): string => {
    if (module.type === 'mail') {
      const domain = (module as MailModuleConfig).userEmail?.split('@')[1] || 'gmail.com';
      return `https://mail.${domain}/inbox`;
    }
    if (module.type === 'search') {
      const brand = (module as SearchModuleConfig).brandName?.toLowerCase().replace(/\s+/g, '') || 'search';
      return `https://www.${brand}.com`;
    }
    return '';
  };

  const useBrowserFrame = module.type === 'mail' || module.type === 'search';

  const renderModule = () => {
    switch (module.type) {
      case 'search':   return <SearchModule />;
      case 'chat':     return <ChatModule />;
      case 'mail':     return <MailModule />;
      case 'terminal': return <TerminalModule />;
    }
  };

  const content = useBrowserFrame ? (
    <BrowserFrame url={getFakeUrl()} theme={isDark ? 'dark' : 'light'}>
      {renderModule()}
    </BrowserFrame>
  ) : (
    renderModule()
  );

  return (
    <>
      {content}
      {!isPro && (
        <div className="fixed bottom-5 right-5 bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-lg shadow-2xl border border-[#b4975e]/25 z-50">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-[#d1b374] rounded-full animate-pulse" />
            <span className="text-sm font-medium">CineSuite Demo</span>
          </div>
        </div>
      )}
    </>
  );
}

// --- EDITOR ROUTER ---
function EditorRouter() {
  const getCurrentScene = useProjectStore((state: any) => state.getCurrentScene);
  const currentScene = getCurrentScene();
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (!currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f12] text-[#ebe7df]">
        <div className="text-center">
          <p className="text-[#a9a49b] mb-4">Scène introuvable</p>
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="cine-button-primary px-5 py-2 rounded text-sm font-medium"
          >
            Retour au projet
          </button>
        </div>
      </div>
    );
  }

  switch (currentScene.module.type) {
    case 'search':   return <SearchEditor />;
    case 'chat':     return <ChatEditor />;
    case 'mail':     return <MailEditor />;
    case 'terminal': return <TerminalEditor />;
    default:         return null;
  }
}

// --- APP ---
function App() {
  const { appMode } = useNetworkStore();

  return (
    <>
      {/* NetworkStatus — masqué en mode play */}
      <NetworkStatus />

      {/* Télécommande flottante (sauf mode screen) */}
      {appMode !== 'screen' && <FloatingRemoteControl />}

      <Routes>
        <Route path="/"                                               element={<Navigate to="/role-selector" replace />} />
        <Route path="/role-selector"                                  element={<RoleSelector />} />
        <Route path="/controller/:roomId"                             element={<ControllerPage />} />
        <Route path="/screen/:roomId"                                 element={<ScreenPage />} />
        <Route path="/projects"                                       element={<ProjectsListPage />} />
        <Route path="/project/:projectId"                             element={<ProjectDetailPage />} />
        <Route path="/project/:projectId/scene/:sceneId/play"         element={<Player />} />
        <Route path="/project/:projectId/scene/:sceneId/edit"         element={<EditorRouter />} />
      </Routes>
    </>
  );
}

export default App;
