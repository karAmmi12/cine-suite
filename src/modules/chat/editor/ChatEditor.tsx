import { useState } from 'react';
import { Plus, Trash, ArrowRightLeft, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { useEditorActions } from '../../../core/hooks/useEditorActions';
import type { ChatModuleConfig, ChatMessage } from '../../../core/types/schema';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';
import { generateChatConfig } from '../../../core/services/configGeneratorService';
import { EditorShell } from '../../../ui/layout/EditorShell';

const inputCls = 'w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.25)] rounded-lg px-3 py-2 text-sm text-[#ebe7df] placeholder-[#4a4840] outline-none focus:border-[#d1b374] transition-colors';
const labelCls = 'block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5';
const sectionCls = 'bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl p-5 space-y-5';
const sectionTitleCls = 'text-[10px] font-semibold text-[#d1b374] uppercase tracking-widest border-b border-[rgba(180,151,94,0.15)] pb-2 mb-4';

export const ChatEditor = () => {
  const { currentScene, updateCurrentScene, globalSettings } = useEditorActions();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentScene || currentScene.module.type !== 'chat') return null;
  const config = currentScene.module as ChatModuleConfig;

  const updateConfig = (key: keyof ChatModuleConfig, value: any) => {
    updateCurrentScene({ module: { ...config, [key]: value } });
  };

  const updateMessage = (id: string, field: keyof ChatMessage, value: any) => {
    const history = config.messagesHistory.map(m => m.id === id ? { ...m, [field]: value } : m);
    updateConfig('messagesHistory', history);
  };

  const addMessage = () => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      isMe: false,
      text: 'Nouveau message...',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
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

  const handleAiGeneration = async () => {
    if (!globalSettings?.aiKey) { alert('Clé API Groq manquante — cliquez sur 🔑 en haut.'); return; }
    const context = prompt("Contexte de la conversation ?\n(ex: Dispute de couple, Planification d'une mission, Discussion entre amis...)");
    if (!context) return;

    setIsGenerating(true);
    try {
      const generated = await generateChatConfig(context, {
        apiKey: globalSettings.aiKey,
        context: `Contact: ${config.contactName}`
      });
      updateCurrentScene({
        module: { ...config, contactName: generated.contactName, messagesHistory: generated.messagesHistory }
      });
    } catch (e: any) {
      alert('Erreur IA : ' + (e.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <EditorShell>
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 pb-24">

        {/* ─── Contact ─── */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Contact</h2>

          <div className="flex gap-6">
            <div className="shrink-0">
              <label className={labelCls}>Avatar</label>
              <ImagePicker
                label=""
                value={config.contactAvatar}
                onChange={(val) => updateConfig('contactAvatar', val)}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className={labelCls}>Nom du contact</label>
                <input
                  value={config.contactName}
                  onChange={(e) => updateConfig('contactName', e.target.value)}
                  className={inputCls}
                  placeholder="ex: Maman, Inconnu, Agent K..."
                />
              </div>
              <div>
                <label className={labelCls}>Message à taper — Magic Typing</label>
                <input
                  value={config.triggerText}
                  onChange={(e) => updateConfig('triggerText', e.target.value)}
                  className={`${inputCls} font-mono`}
                  placeholder="Ce que l'acteur va « taper »..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Historique ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#a9a49b] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={13} /> Historique ({config.messagesHistory.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleAiGeneration}
                disabled={isGenerating}
                className="flex items-center gap-1.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {isGenerating ? 'Génération...' : 'Générer IA'}
              </button>
              <button
                onClick={addMessage}
                className="flex items-center gap-1.5 cine-button-muted text-xs font-medium px-3 py-1.5 rounded-lg"
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>
          </div>

          {config.messagesHistory.length === 0 && (
            <div className="text-center py-10 border border-dashed border-[rgba(180,151,94,0.2)] rounded-xl text-[#4a4840] text-sm">
              Aucun message. Cliquez sur « Ajouter » ou « Générer IA ».
            </div>
          )}

          <div className="space-y-2.5">
            {config.messagesHistory.map((msg) => (
              <div
                key={msg.id}
                className={`relative flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  msg.isMe
                    ? 'bg-[#16202b] border-blue-500/20 ml-8'
                    : 'bg-[#14161b] border-[rgba(180,151,94,0.12)] mr-8'
                }`}
              >
                {/* Sender badge */}
                <span className={`absolute -top-2.5 left-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  msg.isMe
                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                    : 'bg-[#1c1f26] text-[#a9a49b] border-[rgba(180,151,94,0.2)]'
                }`}>
                  {msg.isMe ? 'Moi' : config.contactName}
                </span>

                {/* Toggle sender */}
                <button
                  onClick={() => toggleSender(msg.id)}
                  title="Changer l'expéditeur"
                  className="mt-1 p-1.5 rounded-full bg-[#1c1f26] border border-[rgba(180,151,94,0.2)] text-[#5a5862] hover:text-[#d1b374] transition-colors shrink-0"
                >
                  <ArrowRightLeft size={12} />
                </button>

                <div className="flex-1 space-y-2 pt-0.5">
                  <textarea
                    value={msg.text}
                    onChange={(e) => updateMessage(msg.id, 'text', e.target.value)}
                    rows={2}
                    className="w-full bg-transparent resize-none outline-none text-[#ebe7df] text-sm leading-relaxed placeholder-[#3a3830]"
                  />
                  <div className="flex justify-end pt-1.5 border-t border-[rgba(255,255,255,0.04)]">
                    <input
                      value={msg.time}
                      onChange={(e) => updateMessage(msg.id, 'time', e.target.value)}
                      className="w-14 text-right text-[10px] text-[#5a5862] bg-transparent outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeMessage(msg.id)}
                  className="text-[#3a3830] hover:text-[#dc6f6f] p-1 mt-1 transition-colors shrink-0"
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </EditorShell>
  );
};
