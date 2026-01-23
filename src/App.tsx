import { Routes, Route } from 'react-router-dom';
import { SearchModule } from './modules/search/SearchModule';
import { SearchEditor } from './modules/search/editor/SearchEditor';
import { ChatModule } from './modules/chat/ChatModule';
import { ChatEditor } from './modules/chat/editor/ChatEditor';
import { useSceneStore } from './core/store/sceneStore';
import type { SceneDefinition, SearchModuleConfig, ChatModuleConfig } from './core/types/schema';

// --- COMPOSANT PLAYER (Écran filmé) ---
function Player() {
  const currentScene = useSceneStore((state) => state.currentScene);
  
  if (!currentScene) return <div className="text-white p-10">Erreur: Aucune scène chargée</div>;

  switch (currentScene.module.type) {
    case 'search': return <SearchModule />;
    case 'chat': return <ChatModule />;
    default: return <div>Module inconnu</div>;
  }
}

// --- COMPOSANT ADMIN (Écran de config) ---
function AdminRouter() {
  const { currentScene, loadScene } = useSceneStore();

  if (!currentScene) return <div>Chargement...</div>;

  // Fonction pour changer le type de scène à la volée (Pour tester facilement)
  const switchType = (newType: 'search' | 'chat') => {
    const confirmSwitch = confirm("Attention, changer de type va réinitialiser la scène. Continuer ?");
    if (!confirmSwitch) return;

    // On crée une scène vierge du bon type
    const baseMeta = { ...currentScene.meta, sceneName: `Nouvelle scène ${newType}` };
    
    let newModule: any;
    if (newType === 'search') {
      newModule = { 
        type: 'search', 
        brandName: 'Seeker', 
        triggerText: 'Recherche...', 
        results: [] 
      } as SearchModuleConfig;
    } else {
      newModule = { 
        type: 'chat', 
        contactName: 'Inconnu', 
        triggerText: 'Salut...', 
        messagesHistory: [],
        messageToType: ''
      } as ChatModuleConfig;
    }

    const newScene: SceneDefinition = {
      ...currentScene,
      meta: baseMeta,
      module: newModule
    };

    loadScene(newScene);
    // Petit hack pour recharger la page et vider les états locaux
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div>
      {/* Barre de switch rapide (Seulement pour le dev/admin) */}
      <div className="bg-gray-800 text-white p-2 text-xs flex justify-center gap-4">
        <span>MODE ACTUEL : <strong className="uppercase">{currentScene.module.type}</strong></span>
        <button onClick={() => switchType('search')} className="hover:text-blue-300 underline">Passer en Search</button>
        <button onClick={() => switchType('chat')} className="hover:text-green-300 underline">Passer en Chat</button>
      </div>

      {/* Affichage du bon éditeur */}
      {currentScene.module.type === 'search' ? <SearchEditor /> : <ChatEditor />}
    </div>
  );
}

// --- ROUTING GLOBAL ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<Player />} />
      <Route path="/admin" element={<AdminRouter />} />
    </Routes>
  );
}

export default App;