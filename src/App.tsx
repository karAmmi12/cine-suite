import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Wand2, Film, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchModule } from './modules/search/SearchModule';
import { SearchEditor } from './modules/search/editor/SearchEditor';
import { ChatModule } from './modules/chat/ChatModule';
import { ChatEditor } from './modules/chat/editor/ChatEditor';
import { MailModule } from './modules/mail/MailModule';
import { MailEditor } from './modules/mail/editor/MailEditor';
import { useSceneStore } from './core/store/sceneStore';
import type { SceneDefinition, SearchModuleConfig, ChatModuleConfig, MailModuleConfig } from './core/types/schema';
import { BrowserFrame } from './ui/layout/BrowserFrame';
import { TerminalModule } from './modules/terminal/TerminalModule';
import { TerminalEditor } from './modules/terminal/editor/TerminalEditor';
import type { TerminalModuleConfig } from './core/types/schema';
import { CineAssistant } from './components/CineAssistant';
import { SceneTemplates } from './components/SceneTemplates';
import { GlobalSettings } from './components/GlobalSettings';

// --- PLAYER ---
function Player() {
  const currentScene = useSceneStore((state) => state.currentScene);
  
  if (!currentScene) return <div className="text-white p-10">Erreur: Aucune scène chargée</div>;

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

  // Le Chat mobile n'a pas de cadre navigateur
  if (currentScene.module.type === 'chat') return renderContent();

  return (
    <BrowserFrame url={fakeUrl}>
      {renderContent()}
    </BrowserFrame>
  );
}

// --- ADMIN ---
function AdminRouter() {
  const { currentScene, loadScene } = useSceneStore();

  if (!currentScene) return <div>Chargement...</div>;

  const switchType = (newType: 'search' | 'chat' | 'mail' | 'terminal') => {
    if(!confirm("Changer de mode va réinitialiser la scène. Continuer ?")) return;

    const baseMeta = { ...currentScene.meta, sceneName: `Nouvelle scène ${newType}` };
    let newModule: any;

    if (newType === 'search') {
      newModule = { type: 'search', brandName: 'Seeker', triggerText: 'Recherche...', results: [] } as SearchModuleConfig;
    } else if (newType === 'chat') {
      newModule = { type: 'chat', contactName: 'Inconnu', triggerText: 'Salut...', messagesHistory: [], messageToType: '' } as ChatModuleConfig;
    } 
    else if (newType === 'mail') {
      // Config par défaut pour le Mail
      newModule = { 
        type: 'mail', 
        userEmail: 'heros@gmail.com', 
        triggerText: 'Ceci est un mail important...', 
        emails: [] 
      } as MailModuleConfig;
    }
    else if (newType === 'terminal') {
      // Config par défaut pour le Terminal
      newModule = { 
            type: 'terminal', 
            triggerText: 'init_sequence.sh', 
            color: 'green', 
            lines: ['LOADING KERNEL...', 'BYPASSING FIREWALL...'], 
            typingSpeed: 'fast', 
            showProgressBar: true, 
            progressDuration: 5, 
            finalMessage: 'ACCESS GRANTED', 
            finalStatus: 'success' 
        } as TerminalModuleConfig;
    }

    const newScene: SceneDefinition = { ...currentScene, meta: baseMeta, module: newModule };
    loadScene(newScene);
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <div>
      {/* Barre de switch admin */}
      <div className="bg-gray-800 text-white p-2 text-xs flex justify-between items-center px-4">
        <div className="flex gap-4 items-center">
          <span className="opacity-50">MODE : <strong className="uppercase text-white ml-1">{currentScene.module.type}</strong></span>
          <div className="h-4 w-px bg-gray-600"></div>
          <button onClick={() => switchType('search')} className="hover:text-blue-300 hover:underline">Search</button>
          <button onClick={() => switchType('chat')} className="hover:text-green-300 hover:underline">Chat</button>
          <button onClick={() => switchType('mail')} className="hover:text-red-300 hover:underline">Mail</button>
          <button onClick={() => switchType('terminal')} className="hover:text-amber-300 hover:underline">Terminal</button>
        </div>
        
        {/* Bouton Visualiser */}
        <Link
          to="/"
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-xs">▶️ Visualiser</span>
        </Link>
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
  const { loadScene } = useSceneStore();

  // Affiche les boutons flottants seulement sur la page admin
  const isAdminPage = window.location.pathname === '/admin';

  return (
    <>
      {/* Boutons Flottants - Mode Plateau */}
      {isAdminPage && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-4 bg-gray-700 text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:scale-110 group"
            title="Paramètres"
          >
            <Settings size={24} />
          </button>
          
          <button
            onClick={() => setShowTemplates(true)}
            className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 group"
            title="Bibliothèque de scènes"
          >
            <Film size={24} />
          </button>
          
          <button
            onClick={() => setShowAssistant(true)}
            className="p-5 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 animate-pulse group"
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
          onSelectTemplate={(template) => {
            // Convertir le template en SceneDefinition avec meta
            const scene: SceneDefinition = {
              id: Date.now().toString(),
              module: template.module,
              globalSettings: template.globalSettings || {
                themeId: 'light',
                zoomLevel: 100,
                accentColor: '#4f46e5'
              },
              meta: {
                projectName: 'Bibliothèque',
                sceneName: template.name,
                createdAt: new Date().toISOString()
              }
            };
            loadScene(scene);
            setShowTemplates(false);
          }}
        />
      )}
      {showSettings && <GlobalSettings onClose={() => setShowSettings(false)} />}

      <Routes>
        <Route path="/" element={<Player />} />
        <Route path="/admin" element={<AdminRouter />} />
      </Routes>
    </>
  );
}

export default App;