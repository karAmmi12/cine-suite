import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Monitor, Users, ArrowLeft } from 'lucide-react';
import { useSharedSignalR } from '../core/hooks/useSharedSignalR';
import { useNetworkStore } from '../core/store/networkStore';
import { useProjectSync } from '../core/hooks/useProjectSync';
import { BrowserFrame } from '../ui/layout/BrowserFrame';
import { SearchModule } from '../modules/search/SearchModule';
import { ChatModule } from '../modules/chat/ChatModule';
import { MailModule } from '../modules/mail/MailModule';
import { TerminalModule } from '../modules/terminal/TerminalModule';
import { defaultSearchConfig, defaultChatConfig, defaultMailConfig, defaultTerminalConfig } from '../core/utils/defaultModuleConfigs';
import type {
  SceneDefinition,
  SearchModuleConfig,
  MailModuleConfig,
  ChatModuleConfig,
  TerminalModuleConfig,
} from '../core/types/schema';

export const ScreenPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { sendStateUpdate, isConnected, roomClients, getRoomClients } = useSharedSignalR();
  const { deviceType, lastAction } = useNetworkStore();

  // Active le répondant de synchro projets (desktop répond à RequestProjectsData)
  useProjectSync();

  const [currentModule, setCurrentModule] = useState<'search' | 'chat' | 'mail' | 'terminal' | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTopBar, setShowTopBar] = useState(false);
  const [useRealScene, setUseRealScene] = useState(false);
  const [receivedScene, setReceivedScene] = useState<SceneDefinition | null>(null);
  const [typingText, setTypingText] = useState<string>('');

  useEffect(() => {
    if (isConnected) getRoomClients();
  }, [isConnected, getRoomClients]);

  const controllers = roomClients.filter(c => c.role === 'controller');

  useEffect(() => {
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'SWITCH_MODULE':
        setCurrentModule(lastAction.payload?.module || null);
        setShowWelcome(false);
        setUseRealScene(false);
        setReceivedScene(null);
        sendStateUpdate('MODULE_CHANGED', { module: lastAction.payload?.module });
        break;

      case 'START_TYPING':
        setTypingText(lastAction.payload?.text || '');
        sendStateUpdate('TYPING_STARTED', { text: lastAction.payload?.text });
        break;

      case 'PLAY_SCENE': {
        const { scene } = lastAction.payload || {};
        if (scene?.module?.type) {
          setReceivedScene(scene as SceneDefinition);
          setCurrentModule(scene.module.type);
          setUseRealScene(true);
          setShowWelcome(false);
          sendStateUpdate('SCENE_PLAYING', lastAction.payload);
        } else {
          console.error('PLAY_SCENE: données de scène manquantes', lastAction.payload);
        }
        break;
      }

      case 'CUSTOM_MESSAGE':
        alert(`Message reçu: ${lastAction.payload?.message}`);
        sendStateUpdate('MESSAGE_RECEIVED', { message: lastAction.payload?.message });
        break;
    }
  }, [lastAction, sendStateUpdate]);

  const renderModule = () => {
    if (showWelcome || !currentModule) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <Monitor size={80} className="text-[#d1b374] mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-[#ebe7df] mb-4">Écran en attente</h1>
            <p className="text-[#a9a49b] text-lg mb-6">Prêt à recevoir des commandes...</p>
            <div className="cine-panel rounded-2xl p-6 inline-block">
              <p className="text-[#8f8a81] text-sm mb-2">Room ID :</p>
              <p className="text-[#d1b374] font-mono text-lg">{roomId}</p>
            </div>
          </div>
        </div>
      );
    }

    // --- Scène réelle reçue via PLAY_SCENE ---
    if (useRealScene && receivedScene) {
      const mod = receivedScene.module;
      const isDark = receivedScene.globalSettings?.themeId === 'dark';

      switch (mod.type) {
        case 'search': {
          const cfg = mod as SearchModuleConfig;
          const brand = cfg.brandName?.toLowerCase().replace(/\s+/g, '') || 'search';
          return (
            <BrowserFrame url={`https://www.${brand}.com`} theme={isDark ? 'dark' : 'light'}>
              <SearchModule config={cfg} />
            </BrowserFrame>
          );
        }
        case 'mail': {
          const cfg = mod as MailModuleConfig;
          const domain = cfg.userEmail?.split('@')[1] || 'gmail.com';
          return (
            <BrowserFrame url={`https://mail.${domain}/inbox`} theme={isDark ? 'dark' : 'light'}>
              <MailModule config={cfg} />
            </BrowserFrame>
          );
        }
        case 'chat':
          return <ChatModule config={mod as ChatModuleConfig} />;
        case 'terminal':
          return <TerminalModule config={mod as TerminalModuleConfig} />;
        default:
          return null;
      }
    }

    // --- Mode flexible (SWITCH_MODULE sans scène) ---
    switch (currentModule) {
      case 'search':   return <SearchModule config={defaultSearchConfig} typingText={typingText} />;
      case 'chat':     return <ChatModule config={defaultChatConfig} typingText={typingText} />;
      case 'mail':     return <MailModule config={defaultMailConfig} typingText={typingText} />;
      case 'terminal': return <TerminalModule config={defaultTerminalConfig} typingText={typingText} />;
      default:         return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Zone invisible de toggle de la barre debug (double-clic coin haut-droit) */}
      {!showWelcome && (
        <div
          className="fixed top-0 right-0 w-16 h-16 z-50 cursor-pointer opacity-0"
          onDoubleClick={() => setShowTopBar(v => !v)}
        />
      )}

      {!showWelcome && showTopBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-[#b4975e]/15">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => navigate('/role-selector')}
              className="p-2 cine-button-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full ${isConnected ? 'bg-emerald-900/40 text-emerald-300' : 'bg-rose-900/40 text-rose-300'}`}>
                {isConnected ? '● Connecté' : '○ Déconnecté'}
              </span>
              <span className="flex items-center gap-1.5 text-[#c8c3bb] bg-white/10 px-3 py-1 rounded-full border border-[#b4975e]/20">
                <Users size={14} /> {controllers.length} controller(s)
              </span>
              <span className="text-[#8f8a81] text-xs capitalize">{deviceType}</span>
            </div>
          </div>
        </div>
      )}

      <div className={!showWelcome && showTopBar ? 'pt-16' : ''}>
        {renderModule()}
      </div>
    </div>
  );
};
