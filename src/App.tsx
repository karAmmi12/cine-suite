import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Wand2, Film, Settings, ArrowLeft, Play } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { SearchModule } from './modules/search/SearchModule';
import { SearchEditor } from './modules/search/editor/SearchEditor';
import { ChatModule } from './modules/chat/ChatModule';
import { ChatEditor } from './modules/chat/editor/ChatEditor';
import { MailModule } from './modules/mail/MailModule';
import { MailEditor } from './modules/mail/editor/MailEditor';
import { TerminalModule } from './modules/terminal/TerminalModule';
import { TerminalEditor } from './modules/terminal/editor/TerminalEditor';
import { useProjectStore } from './core/store/projectStore';
// import type { SceneDefinition } from './core/types/schema';
import { BrowserFrame } from './ui/layout/BrowserFrame';
import { CineAssistant } from './components/CineAssistant';
import { SceneTemplates } from './components/SceneTemplates';
import { GlobalSettings } from './components/GlobalSettings';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

// --- PLAYER ---
function Player() {
  const getCurrentScene = useProjectStore((state) => state.getCurrentScene);
  const currentScene = getCurrentScene();
  
  // Watermark Freemium
  const isPro = false; // TODO: Intégrer système de license
  
  if (!currentScene) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Aucune scène sélectionnée</h2>
          <a href="/projects" className="text-blue-400 hover:underline">
            Retour aux projets
          </a>
        </div>
      </div>
    );
  }

  let fakeUrl = "https://www.google.com";
  if (currentScene.module.type === 'mail') {
     fakeUrl = "https://mail.google.com/mail/u/0/#inbox";
  } else if (currentScene.module.type === 'search') {
     fakeUrl = "https://www.google.com/search?q=" + encodeURIComponent(currentScene.module.triggerText);
  }

  const renderContent = () => {
    switch (currentScene.module.type) {
      case 'search': return <SearchModule />;
      case 'chat': return <ChatModule />;
      case 'mail': return <MailModule />;
      case 'terminal': return <TerminalModule />;
      default: return <div>Module inconnu</div>;
    }
  };

  const content = (
    <>
      {currentScene.module.type === 'chat' ? (
        renderContent()
      ) : (
        <BrowserFrame url={fakeUrl}>
          {renderContent()}
        </BrowserFrame>
      )}
      
      {/* WATERMARK FREEMIUM */}
      {!isPro && (
        <div className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-lg shadow-2xl border border-white/20 z-50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-sm">CineSuite Demo</span>
            <a 
              href="https://cinesuite.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs underline"
            >
              Obtenir Pro
            </a>
          </div>
        </div>
      )}
    </>
  );

  return content;
}

// --- EDITOR ROUTER ---
function EditorRouter() {
  const { projectId, sceneId } = useParams();
  const navigate = useNavigate();
  const getCurrentScene = useProjectStore((state) => state.getCurrentScene);
  const getProject = useProjectStore((state) => state.getProject);
  const currentScene = getCurrentScene();
  const project = getProject(projectId!);

  if (!currentScene) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Scène introuvable</h2>
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            Retour au projet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Barre de navigation */}
      <div className="bg-gray-800 text-white p-2 text-xs flex justify-between items-center px-4">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="flex items-center gap-2 hover:bg-gray-700 px-3 py-1.5 rounded transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{project?.name}</span>
          </button>
          <div className="h-4 w-px bg-gray-600"></div>
          <span className="opacity-50">
            MODE : <strong className="uppercase text-white ml-1">{currentScene.module.type}</strong>
          </span>
        </div>
        
        {/* Bouton Visualiser */}
        <button
          onClick={() => navigate(`/project/${projectId}/scene/${sceneId}/play`)}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors"
        >
          <Play size={14} />
          <span className="text-xs">Visualiser</span>
        </button>
      </div>

      {/* Affichage conditionnel de l'éditeur */}
      {currentScene.module.type === 'search' && <SearchEditor />}
      {currentScene.module.type === 'chat' && <ChatEditor />}
      {currentScene.module.type === 'mail' && <MailEditor />}
      {currentScene.module.type === 'terminal' && <TerminalEditor />}
    </div>
  );
}

function App() {
  const [showAssistant, setShowAssistant] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Affiche les boutons flottants seulement sur les pages d'édition
  const isEditorPage = window.location.pathname.includes('/edit');

  return (
    <>
      {/* Boutons Flottants - Mode Plateau */}
      {isEditorPage && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-4 bg-gray-700 text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:scale-110"
            title="Paramètres"
          >
            <Settings size={24} />
          </button>
          
          <button
            onClick={() => setShowTemplates(true)}
            className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110"
            title="Bibliothèque de scènes"
          >
            <Film size={24} />
          </button>
          
          <button
            onClick={() => setShowAssistant(true)}
            className="p-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 animate-pulse"
            title="Assistant Cinéma IA"
          >
            <Wand2 size={28} />
          </button>
        </div>
      )}

      {/* Modals */}
      {showAssistant && <CineAssistant onClose={() => setShowAssistant(false)} />}
      
      {showTemplates && (
        <SceneTemplates 
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={() => {
            // TODO: Adapter pour ajouter au projet actuel
            // const scene: SceneDefinition = {...}
            setShowTemplates(false);
          }}
        />
      )}
      
      {showSettings && <GlobalSettings onClose={() => setShowSettings(false)} />}

      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/project/:projectId" element={<ProjectDetailPage />} />
        <Route path="/project/:projectId/scene/:sceneId/play" element={<Player />} />
        <Route path="/project/:projectId/scene/:sceneId/edit" element={<EditorRouter />} />
      </Routes>
    </>
  );
}

export default App;
