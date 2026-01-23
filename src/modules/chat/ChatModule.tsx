import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, Send, MoreVertical } from 'lucide-react';
import { useSceneStore } from '../../core/store/sceneStore';
import type { ChatModuleConfig, ChatMessage } from '../../core/types/schema';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';

export const ChatModule = () => {
  const scene = useSceneStore((state) => state.currentScene);
  const config = scene?.module as ChatModuleConfig;

  // State local pour gérer les messages affichés (Historique + Nouveaux)
  const [messages, setMessages] = useState<ChatMessage[]>(config?.messagesHistory || []);
  
  // Magic Typing sur le texte prévu dans la config (triggerText)
  const { displayValue, isComplete } = useMagicTyping(config?.triggerText || "");

  // Référence pour scroller automatiquement en bas
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique quand un message s'ajoute
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayValue]);

  // Gestion de l'envoi (Touche Entrée)
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isComplete) {
        // On ajoute le message tapé à la liste
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          isMe: true,
          text: config.triggerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent'
        };
        setMessages((prev) => [...prev, newMessage]);
        
        // Ici, idéalement, on devrait resetter le MagicTyping, 
        // mais pour l'instant on va juste laisser le message envoyé.
      }
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [isComplete, config.triggerText]);

  if (!config) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      
      {/* --- HEADER (Style WhatsApp/iOS) --- */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <ArrowLeft className="text-blue-500 w-6 h-6" />
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-lg overflow-hidden">
             {config.contactAvatar ? (
               <img src={config.contactAvatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               config.contactName.charAt(0)
             )}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 leading-tight">{config.contactName}</h1>
            <span className="text-xs text-green-500 font-medium">En ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-5 text-blue-500">
          <Video className="w-6 h-6" />
          <Phone className="w-6 h-6" />
        </div>
      </div>

      {/* --- BODY (Liste des messages) --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5e5e5]"> 
        {/* Note: bg-[#e5e5e5] est une couleur neutre classique de fond de chat */}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-[17px] leading-snug shadow-sm relative ${
                msg.isMe 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-900 rounded-bl-none'
              }`}
            >
              {msg.text}
              
              {/* Heure du message */}
              <div className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* --- FOOTER (Zone de frappe) --- */}
      <div className="bg-white p-3 flex items-end gap-3 border-t border-gray-200">
        <PlusButton />
        
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 min-h-[44px] border border-gray-200 focus-within:border-blue-500 transition-colors">
            {/* C'est ici que le Magic Typing s'affiche */}
            <span className="text-[17px] text-gray-900 break-words">
                {displayValue}
                {!isComplete && (
                  <span className="inline-block w-[2px] h-5 bg-blue-500 animate-pulse align-middle ml-0.5" />
                )}
            </span>
             {/* Placeholder si vide */}
            {displayValue.length === 0 && <span className="text-gray-400 select-none">Message...</span>}
        </div>

        <button className={`p-2.5 rounded-full transition-all ${displayValue.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

// Petit composant UI pour le bouton "+"
const PlusButton = () => (
    <button className="text-blue-500 p-2">
        <MoreVertical className="w-6 h-6 rotate-90" />
    </button>
);