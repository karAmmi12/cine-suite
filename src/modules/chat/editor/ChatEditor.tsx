import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash, Play, Download, Upload, ArrowRightLeft, MessageSquare } from 'lucide-react';

// Imports internes
import { useSceneStore } from '../../../core/store/sceneStore';
import type { ChatModuleConfig, ChatMessage } from '../../../core/types/schema';
import { downloadSceneConfig, readJsonFile } from '../../../core/utils/fileHandler';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';

export const ChatEditor = () => {
  const { currentScene, updateScene, loadScene } = useSceneStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sécurité
  if (!currentScene || currentScene.module.type !== 'chat') {
    return <div className="p-8 text-red-500">Erreur : Aucune scène de Chat active.</div>;
  }

  const config = currentScene.module as ChatModuleConfig;

  // --- 1. LOGIQUE DE MISE À JOUR ---

  const updateConfig = (key: keyof ChatModuleConfig, value: any) => {
    updateScene({
      module: { ...config, [key]: value }
    });
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
      isMe: false, // Par défaut c'est l'autre qui parle
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

  // --- 2. LOGIQUE IMPORT / EXPORT ---

  const handleExport = () => downloadSceneConfig(currentScene);
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const newScene = await readJsonFile(file);
        if (newScene.module.type !== 'chat') {
            alert("Attention : Ce fichier n'est pas une scène de Chat.");
        }
        loadScene(newScene);
        e.target.value = '';
      } catch (err) {
        alert("Erreur import : " + err);
      }
    }
  };

  // --- 3. RENDU VISUEL ---

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans pb-32">
      <div className="max-w-3xl mx-auto">
        
        {/* === HEADER === */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">CineSuite Studio</h1>
            <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Éditeur de Chat</p>
          </div>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            
            <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
              <Upload size={16}/><span className="hidden sm:inline">Importer</span>
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
              <Download size={16}/><span className="hidden sm:inline">Exporter</span>
            </button>
            
            <div className="w-px h-8 bg-gray-300 mx-2"></div>
            
            <Link to="/" target="_blank" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md shadow-green-200 font-bold text-sm transition-all">
              <Play size={16} /> VOIR LE RÉSULTAT
            </Link>
          </div>
        </div>

        {/* === CONFIGURATION CONTACT === */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Paramètres de la Conversation</h2>
          
          <div className="flex flex-col sm:flex-row gap-8">
             {/* Gestion Avatar */}
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
                        placeholder="Ex: Sarah"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message à taper (Magic Typing)</label>
                    <input 
                        value={config.triggerText}
                        onChange={(e) => updateConfig('triggerText', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-green-50 text-green-900 font-mono text-sm outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Le texte que l'acteur va écrire..."
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
                <button onClick={addMessage} className="flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={16}/> Ajouter un message
                </button>
            </div>

            {config.messagesHistory.length === 0 && (
                 <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    Conversation vide. Ajoutez un message pour commencer.
                </div>
            )}

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
                        {/* Indicateur visuel de qui parle */}
                        <div className={`absolute -top-3 left-4 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border
                            ${msg.isMe ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {msg.isMe ? 'Moi (Acteur)' : config.contactName}
                        </div>

                        {/* Bouton Toggle Sender */}
                        <button 
                            onClick={() => toggleSender(msg.id)}
                            className="mt-2 p-1.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 shadow-sm transition-all"
                            title="Changer d'émetteur (Moi <-> L'autre)"
                        >
                            <ArrowRightLeft size={14} />
                        </button>

                        {/* Contenu du message */}
                        <div className="flex-1 space-y-2 pt-1">
                            <textarea 
                                value={msg.text}
                                onChange={(e) => updateMessage(msg.id, 'text', e.target.value)}
                                className="w-full bg-transparent resize-none outline-none text-gray-800 leading-relaxed font-medium"
                                rows={2}
                                placeholder="Texte du message..."
                            />
                            
                            <div className="flex justify-end items-center gap-2 pt-2 border-t border-black/5">
                                <span className="text-xs text-gray-400 font-bold uppercase">Heure :</span>
                                <input 
                                    value={msg.time}
                                    onChange={(e) => updateMessage(msg.id, 'time', e.target.value)}
                                    className="w-16 text-right text-xs bg-white/50 border border-transparent hover:border-gray-200 rounded px-1 outline-none focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Bouton Supprimer */}
                        <button 
                            onClick={() => removeMessage(msg.id)} 
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors self-start"
                            title="Supprimer ce message"
                        >
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