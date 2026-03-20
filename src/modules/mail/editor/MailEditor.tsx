import { useState } from 'react';
import { Plus, Trash, Mail, CheckSquare, Square, Sparkles, Loader2 } from 'lucide-react';
import { useEditorActions } from '../../../core/hooks/useEditorActions';
import type { MailModuleConfig, MailMessage } from '../../../core/types/schema';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';
import { generateMailConfig } from '../../../core/services/configGeneratorService';
import { EditorShell } from '../../../ui/layout/EditorShell';

const inputCls = 'w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.25)] rounded-lg px-3 py-2 text-sm text-[#ebe7df] placeholder-[#4a4840] outline-none focus:border-[#d1b374] transition-colors';
const labelCls = 'block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5';
const sectionCls = 'bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl p-5 space-y-5';
const sectionTitleCls = 'text-[10px] font-semibold text-[#d1b374] uppercase tracking-widest border-b border-[rgba(180,151,94,0.15)] pb-2 mb-4';

export const MailEditor = () => {
  const { currentScene, updateCurrentScene, globalSettings } = useEditorActions();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentScene || currentScene.module.type !== 'mail') return null;
  const config = currentScene.module as MailModuleConfig;

  const updateConfig = (key: keyof MailModuleConfig, value: any) => {
    updateCurrentScene({ module: { ...config, [key]: value } });
  };

  const updateMail = (id: string, field: keyof MailMessage, value: any) => {
    const emails = config.emails.map(e => e.id === id ? { ...e, [field]: value } : e);
    updateConfig('emails', emails);
  };

  const addMail = () => {
    const newMail: MailMessage = {
      id: Date.now().toString(),
      folder: 'inbox',
      read: false,
      senderName: 'Nouveau Contact',
      senderEmail: 'contact@exemple.com',
      subject: 'Sujet du mail',
      preview: 'Aperçu...',
      body: 'Contenu du message...',
      date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    updateConfig('emails', [newMail, ...config.emails]);
  };

  const removeMail = (id: string) => {
    updateConfig('emails', config.emails.filter(e => e.id !== id));
  };

  const handleAiGeneration = async () => {
    if (!globalSettings?.aiKey) { alert('Clé API Groq manquante — cliquez sur 🔑 en haut.'); return; }
    const context = prompt('Contexte des emails ?\n(ex: Employé sous pression, Harcèlement professionnel, Ultimatum d\'un supérieur...)');
    if (!context) return;

    setIsGenerating(true);
    try {
      const generated = await generateMailConfig(context, { apiKey: globalSettings.aiKey });
      updateConfig('emails', generated.emails);
    } catch (e: any) {
      alert('Erreur IA : ' + (e.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <EditorShell>
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6 pb-24">

        {/* ─── Identité du personnage ─── */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Identité du personnage</h2>

          <div className="flex gap-6">
            <div className="shrink-0">
              <label className={labelCls}>Avatar</label>
              <ImagePicker
                label=""
                value={config.userAvatar}
                onChange={(val) => updateConfig('userAvatar', val)}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className={labelCls}>Adresse email du personnage</label>
                <input
                  value={config.userEmail}
                  onChange={(e) => updateConfig('userEmail', e.target.value)}
                  className={inputCls}
                  placeholder="hero@gmail.com"
                />
              </div>
              <div>
                <label className={labelCls}>Message à écrire — Magic Typing</label>
                <textarea
                  value={config.triggerText}
                  onChange={(e) => updateConfig('triggerText', e.target.value)}
                  rows={3}
                  className={`${inputCls} font-mono resize-none`}
                  placeholder="Corps du mail que l'acteur va « taper »..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Boîte de réception ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#a9a49b] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={13} /> Boîte de réception ({config.emails.length})
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
                onClick={addMail}
                className="flex items-center gap-1.5 cine-button-muted text-xs font-medium px-3 py-1.5 rounded-lg"
              >
                <Plus size={13} /> Manuel
              </button>
            </div>
          </div>

          {config.emails.length === 0 && (
            <div className="text-center py-10 border border-dashed border-[rgba(180,151,94,0.2)] rounded-xl text-[#4a4840] text-sm">
              Aucun email. Cliquez sur « Manuel » ou « Générer IA ».
            </div>
          )}

          <div className="space-y-3">
            {config.emails.map((mail) => (
              <div key={mail.id} className="bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl overflow-hidden">

                {/* Mail header */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(180,151,94,0.08)]">
                  <button
                    onClick={() => updateMail(mail.id, 'read', !mail.read)}
                    className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                      mail.read
                        ? 'bg-[#1c1f26] text-[#5a5862] border-[rgba(180,151,94,0.15)]'
                        : 'bg-blue-950/50 text-blue-300 border-blue-800/40'
                    }`}
                  >
                    {mail.read ? <CheckSquare size={11} /> : <Square size={11} />}
                    {mail.read ? 'Lu' : 'Non lu'}
                  </button>
                  <div className="flex-1" />
                  <input
                    value={mail.date}
                    onChange={(e) => updateMail(mail.id, 'date', e.target.value)}
                    className="w-20 text-right text-[11px] text-[#5a5862] bg-transparent outline-none"
                  />
                  <button
                    onClick={() => removeMail(mail.id)}
                    className="text-[#3a3830] hover:text-[#dc6f6f] p-1 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>

                {/* Mail fields */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={mail.senderName}
                      onChange={(e) => updateMail(mail.id, 'senderName', e.target.value)}
                      placeholder="Nom de l'expéditeur"
                      className="bg-transparent text-[#ebe7df] font-semibold text-sm outline-none border-b border-transparent focus:border-[rgba(180,151,94,0.3)] pb-0.5 transition-colors"
                    />
                    <input
                      value={mail.senderEmail}
                      onChange={(e) => updateMail(mail.id, 'senderEmail', e.target.value)}
                      placeholder="email@exemple.com"
                      className="bg-transparent text-[#a9a49b] text-xs outline-none border-b border-transparent focus:border-[rgba(180,151,94,0.3)] pb-0.5 transition-colors"
                    />
                  </div>

                  <input
                    value={mail.subject}
                    onChange={(e) => updateMail(mail.id, 'subject', e.target.value)}
                    placeholder="Objet du message"
                    className="w-full bg-transparent text-[#ebe7df] font-medium outline-none border-b border-transparent focus:border-[rgba(180,151,94,0.3)] pb-0.5 transition-colors"
                  />

                  <textarea
                    value={mail.body}
                    onChange={(e) => updateMail(mail.id, 'body', e.target.value)}
                    placeholder="Corps du message..."
                    rows={3}
                    className="w-full bg-[#0d0f12] border border-[rgba(180,151,94,0.1)] rounded-lg px-3 py-2 text-sm text-[#a9a49b] placeholder-[#3a3830] outline-none resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </EditorShell>
  );
};
