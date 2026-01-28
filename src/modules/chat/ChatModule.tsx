import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, Send, Check, CheckCheck, Image, Smile } from 'lucide-react';
import { useSceneStore } from '../../core/store/sceneStore';
import type { ChatModuleConfig, ChatMessage } from '../../core/types/schema';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';

export const ChatModule = () => {
  const scene = useSceneStore((state) => state.currentScene);
  const config = scene?.module as ChatModuleConfig;

  const [messages, setMessages] = useState<ChatMessage[]>(config?.messagesHistory || []);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  
  const { displayValue, isComplete } = useMagicTyping(config?.triggerText || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayValue, showTypingIndicator]);

  useEffect(() => {
    if (displayValue.length > 0 && !isComplete) {
      setShowTypingIndicator(false);
    }
  }, [displayValue, isComplete]);

  const sendMessage = () => {
    if (isComplete && displayValue.length > 0) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        isMe: true,
        text: config.triggerText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages((prev) => [...prev, newMessage]);
      
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'delivered' } : m
          )
        );
      }, 800);
      
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMessage.id ? { ...m, status: 'read' } : m
          )
        );
      }, 2000);
    }
  };

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isComplete) {
        sendMessage();
      }
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [isComplete, config.triggerText]);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice && isComplete && displayValue.length > 0) {
      const timer = setTimeout(() => sendMessage(), 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, displayValue]);

  if (!config) return null;

  const theme = config.theme || 'whatsapp';
  const themeColors = {
    whatsapp: { bg: 'bg-[#e5e5e5]', myBubble: 'bg-blue-500', theirBubble: 'bg-white', accent: 'text-green-500' },
    imessage: { bg: 'bg-white', myBubble: 'bg-blue-500', theirBubble: 'bg-gray-200', accent: 'text-blue-500' },
    telegram: { bg: 'bg-gray-100', myBubble: 'bg-blue-400', theirBubble: 'bg-white', accent: 'text-blue-400' },
    messenger: { bg: 'bg-white', myBubble: 'bg-blue-600', theirBubble: 'bg-gray-200', accent: 'text-blue-600' }
  };
  const colors = themeColors[theme];

  return (
    <div className="flex flex-col h-dvh bg-gray-100 font-sans overflow-hidden">
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
            <span className={`text-xs ${colors.accent} font-medium`}>
              {config.contactStatus || 'En ligne'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5 text-blue-500">
          <Video className="w-6 h-6" />
          <Phone className="w-6 h-6" />
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${colors.bg} touch-pan-y`}> 
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-[17px] leading-snug shadow-sm relative ${
                msg.isMe 
                  ? `${colors.myBubble} text-white rounded-br-none` 
                  : `${colors.theirBubble} text-gray-900 rounded-bl-none`
              }`}
            >
              {msg.mediaUrl && msg.mediaType === 'image' && (
                <img src={msg.mediaUrl} alt="" className="rounded-lg mb-2 max-w-full" />
              )}
              
              {msg.text}
              
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="absolute -bottom-2 right-2 bg-white rounded-full px-2 py-0.5 shadow-md text-sm">
                  {msg.reactions.join(' ')}
                </div>
              )}
              
              <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.edited && <span className="italic">modifié</span>}
                <span>{msg.time}</span>
                {msg.isMe && msg.status === 'delivered' && <Check className="w-3 h-3" />}
                {msg.isMe && msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
              </div>
            </div>
          </div>
        ))}
        
        {(config.isTyping || showTypingIndicator) && (
          <div className="flex justify-start">
            <div className={`${colors.theirBubble} px-4 py-3 rounded-2xl rounded-bl-none shadow-sm`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-3 flex items-end gap-3 border-t border-gray-200">
        <button className="text-gray-400 p-2 hover:text-gray-600 transition-colors">
          <Image className="w-6 h-6" />
        </button>
        
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 min-h-11 border border-gray-200 focus-within:border-blue-500 transition-colors">
            <span className="text-[17px] text-gray-900 wrap-break-word">
                {displayValue}
                {!isComplete && (
                  <span className="inline-block w-0.5 h-5 bg-blue-500 animate-pulse align-middle ml-0.5" />
                )}
            </span>
            {displayValue.length === 0 && <span className="text-gray-400 select-none">Message...</span>}
        </div>

        <button className="text-gray-400 p-2 hover:text-gray-600 transition-colors">
          <Smile className="w-6 h-6" />
        </button>

        <button 
          onClick={sendMessage}
          disabled={!isComplete}
          className={`p-2.5 rounded-full transition-all touch-manipulation ${isComplete ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
