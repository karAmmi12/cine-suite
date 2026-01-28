import { useRef, useState } from 'react';
import { Plus, Trash, Play, Download, Upload, ArrowRightLeft, MessageSquare, Sparkles, Loader2, Key } from 'lucide-react';

// Imports internes
import { useProjectStore } from '../../../core/store/projectStore';
import type { ChatModuleConfig, ChatMessage } from '../../../core/types/schema';
import { downloadSceneConfig, readJsonFile } from '../../../core/utils/fileHandler';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';
import { generateChatConfig } from '../../../core/services/configGeneratorService';

export const ChatEditor = () => {
  const currentScene = useProjectStore((state) => state.getCurrentScene());
  const updateCurrentScene = useProjectStore((state) => state.updateCurrentScene);
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const currentSceneId = useProjectStore((state) => state.currentSceneId);
  
  // Accès aux réglages globaux pour la clé API
  const globalSettings = currentScene?.globalSettings;
  const updateGlobalSettings = (settings: any) => updateCurrentScene({ globalSettings: settings });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sécurité
  if (!currentScene || currentScene.module.type !== 'chat') {
    return <div className="p-8 text-red-500">Erreur : Aucune scène de Chat active.</div>;
  }

  const config = currentScene.module as ChatModuleConfig;

  // --- LOGIQUE IA PROFESSIONNELLE ---
  const handleAiGeneration = async () => {
    if (!globalSettings?.aiKey) {
        alert("⚠️ Veuillez entrer une clé API Groq en haut à droite.");
        return;
    }
    
    const context = prompt("💬 Contexte de la conversation ? (ex: Dispute de couple, Planification de braquage, Discussion entre amis...)");
    if (!context) return;

    setIsGenerating(true);
    try {
      // Utilisation du SERVICE IA PROFESSIONNEL
      const generatedConfig = await generateChatConfig(
        context, 
        { apiKey: globalSettings.aiKey, context: `Contact: ${config.contactName}` }
      );
      
      // On applique TOUTE la configuration générée
      updateCurrentScene({ 
        module: { 
          ...config,
          contactName: generatedConfig.contactName,
          messagesHistory: generatedConfig.messagesHistory 
        } 
      });
      
      alert(`✅ ${generatedConfig.messagesHistory.length} messages générés par l'IA professionnelle !`);
    } catch (e: any) {
      alert("❌ Erreur IA: " + (e.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LOGIQUE DE MISE À JOUR ---
  const updateConfig = (key: keyof ChatModuleConfig, value: any) => {
    updateCurrentScene({ module: { ...config, [key]: value } });
  };

  const updateMessage = (id: string, field: keyof ChatMessage, value: any) => {
    const newHistory = config.messagesHistory.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    updateConfig('messagesHistory', newHistory);
  };

  const addMessage = () => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      isMe: false, 
      text: "Nouveau message...",
      time: "12:00",
      status: 'read'
    };
    updateConfig('messagesHistory', [...config.messagesHistory, newMsg]);
  };

  const removeMessage = (id: string) => {
    updateConfig('messagesHistory', config.messagesHistory.filter(m => m.id !== id));
  };

  const toggleSender = (id: string) => {
    const msg = config.messagesHistory.find(m => m.id === id);
    if (msg) updateMessage(id, 'isMe', !msg.isMe);
  };

  // --- IMPORT / EXPORT ---
  const handleExport = () => downloadSceneConfig(currentScene);
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await readJsonFile(file);
      // TODO: Implémenter loadScene dans projectStore
      alert("Import de scène temporairement désactivé (refactoring en cours)");
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-3xl mx-auto pb-32">
        
        {/* === HEADER === */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">CineSuite Studio</h1>
            <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Éditeur de Chat</p>
          </div>
          <div className="flex gap-2 items-center">
            
            {/* Input Clé API */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 border border-gray-200 mr-2 h-9">
                <Key size={14} className="text-gray-400"/>
                <input 
                    type="password" 
                    placeholder="Clé API Groq..."
                    value={globalSettings?.aiKey || ''}
                    onChange={(e) => updateGlobalSettings({ ...globalSettings, aiKey: e.target.value })}
                    className="bg-transparent border-none outline-none text-xs w-24 focus:w-48 transition-all"
                />
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            
            <button onClick={handleImportClick} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Upload size={18}/></button>
            <button onClick={handleExport} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Download size={18}/></button>
            
            <div className="w-px h-8 bg-gray-300 mx-2"></div>
            
            <button 
                onClick={() => window.open(`/project/${currentProjectId}/scene/${currentSceneId}/play`, 'CinePlayer', 'popup=yes,width=400,height=800')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md shadow-green-200 font-bold text-sm transition-all"
            >
              <Play size={16} /> LANCER
            </button>
          </div>
        </div>

        {/* === CONFIGURATION CONTACT === */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-8">
             <div className="w-full sm:w-auto flex justify-center sm:block">
                <ImagePicker 
                    label="Avatar Contact"
                    value={config.contactAvatar}
                    onChange={(val) => updateConfig('contactAvatar', val)}
                />
             </div>
             <div className="flex-1 grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom du Contact</label>
                    <input 
                        value={config.contactName}
                        onChange={(e) => updateConfig('contactName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 font-bold text-lg outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message à taper (Magic Typing)</label>
                    <input 
                        value={config.triggerText}
                        onChange={(e) => updateConfig('triggerText', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-green-50 text-green-900 font-mono text-sm outline-none"
                    />
                </div>
             </div>
          </div>
        </div>

        {/* === HISTORIQUE DES MESSAGES === */}
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={16} /> Historique ({config.messagesHistory.length})
                </h2>
                
                <div className="flex gap-2">
                    {/* BOUTON IA */}
                    <button 
                        onClick={handleAiGeneration} 
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 text-sm font-bold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-purple-200 disabled:opacity-70"
                    >
                    {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />} 
                    {isGenerating ? '...' : 'Générer IA'}
                    </button>

                    <button onClick={addMessage} className="flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors">
                        <Plus size={16}/> Ajouter
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {config.messagesHistory.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 group
                            ${msg.isMe 
                                ? 'bg-blue-50 border-blue-100 ml-12 rounded-br-none' 
                                : 'bg-white border-gray-200 mr-12 rounded-bl-none shadow-sm'
                            }`}
                    >
                        <div className={`absolute -top-3 left-4 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border
                            ${msg.isMe ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {msg.isMe ? 'Moi' : config.contactName}
                        </div>

                        <button 
                            onClick={() => toggleSender(msg.id)}
                            className="mt-2 p-1.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-blue-500 shadow-sm"
                        >
                            <ArrowRightLeft size={14} />
                        </button>

                        <div className="flex-1 space-y-2 pt-1">
                            <textarea 
                                value={msg.text}
                                onChange={(e) => updateMessage(msg.id, 'text', e.target.value)}
                                className="w-full bg-transparent resize-none outline-none text-gray-800 leading-relaxed font-medium"
                                rows={2}
                            />
                            <div className="flex justify-end items-center gap-2 pt-2 border-t border-black/5">
                                <input 
                                    value={msg.time}
                                    onChange={(e) => updateMessage(msg.id, 'time', e.target.value)}
                                    className="w-16 text-right text-xs bg-white/50 rounded px-1 outline-none"
                                />
                            </div>
                        </div>

                        <button onClick={() => removeMessage(msg.id)} className="text-gray-300 hover:text-red-500 p-2">
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};