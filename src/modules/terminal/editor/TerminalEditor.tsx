import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useEditorActions } from '../../../core/hooks/useEditorActions';
import type { TerminalModuleConfig } from '../../../core/types/schema';
import { generateTerminalConfig } from '../../../core/services/configGeneratorService';
import { EditorShell } from '../../../ui/layout/EditorShell';

const inputCls = 'w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.25)] rounded-lg px-3 py-2 text-sm text-[#ebe7df] placeholder-[#4a4840] outline-none focus:border-[#d1b374] transition-colors';
const labelCls = 'block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5';
const sectionCls = 'bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl p-5';
const sectionTitleCls = 'text-[10px] font-semibold text-[#d1b374] uppercase tracking-widest border-b border-[rgba(180,151,94,0.15)] pb-2 mb-4';
const selectCls = `${inputCls} cursor-pointer`;

const COLORS: { id: TerminalModuleConfig['color']; label: string; hex: string }[] = [
  { id: 'green', label: 'Vert',  hex: '#4ade80' },
  { id: 'blue',  label: 'Bleu',  hex: '#60a5fa' },
  { id: 'red',   label: 'Rouge', hex: '#f87171' },
  { id: 'amber', label: 'Amber', hex: '#fbbf24' },
];

const AI_CONTEXTS = [
  'Hacking d\'un système gouvernemental',
  'Compilation d\'un projet logiciel',
  'Analyse d\'un serveur compromis',
  'Déchiffrement de fichiers cryptés',
  'Déploiement d\'une application',
  'Scan réseau et détection d\'intrusion',
  'Exfiltration de données sensibles',
];

// Génère du faux code technique aléatoire
const generateFakeLogs = (): string[] => {
  const words = ['BYPASS', 'MAINFRAME', 'ENCRYPTION', 'FIREWALL', 'PROXY', 'NODE', 'ROOT', 'ACCESS', 'TOKEN', 'HASH', 'INJECT', 'OVERRIDE'];
  return Array.from({ length: 20 }, () => {
    const cmd = words[Math.floor(Math.random() * words.length)];
    const file = `SYS_${Math.floor(Math.random() * 9999)}.DAT`;
    return `EXECUTING ${cmd} PROTOCOL ON ${file} ... [OK]`;
  });
};

export const TerminalEditor = () => {
  const { currentScene, updateCurrentScene, globalSettings } = useEditorActions();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentScene || currentScene.module.type !== 'terminal') return null;
  const config = currentScene.module as TerminalModuleConfig;

  const updateConfig = (key: keyof TerminalModuleConfig, value: any) => {
    updateCurrentScene({ module: { ...config, [key]: value } });
  };

  const handleAiGeneration = async () => {
    if (!globalSettings?.aiKey) { alert('Clé API Groq manquante — cliquez sur 🔑 en haut.'); return; }

    const contextList = AI_CONTEXTS.map((c, i) => `${i + 1}. ${c}`).join('\n');
    const input = prompt(`Contexte du terminal (numéro ou texte libre) :\n\n${contextList}`);
    if (!input) return;

    const idx = parseInt(input, 10);
    const context = (!isNaN(idx) && idx >= 1 && idx <= AI_CONTEXTS.length)
      ? AI_CONTEXTS[idx - 1]
      : input;

    setIsGenerating(true);
    try {
      const generated = await generateTerminalConfig(context, { apiKey: globalSettings.aiKey, context });
      updateCurrentScene({ module: { ...config, ...generated } });
    } catch (e: any) {
      alert('Erreur IA : ' + (e.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  const activeColor = COLORS.find(c => c.id === config.color) || COLORS[0];

  return (
    <EditorShell>
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6 pb-24">

        {/* ─── Génération IA ─── */}
        <button
          onClick={handleAiGeneration}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-900/30"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? 'Génération avec l\'IA...' : 'Générer avec l\'IA'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ─── Paramètres ─── */}
          <section className={sectionCls}>
            <h2 className={sectionTitleCls}>Paramètres</h2>
            <div className="space-y-5">

              {/* Couleur */}
              <div>
                <label className={labelCls}>Couleur du terminal</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => updateConfig('color', c.id)}
                      title={c.label}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        config.color === c.id
                          ? 'border-white scale-110'
                          : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Commande de départ */}
              <div>
                <label className={labelCls}>Commande — Magic Typing</label>
                <input
                  value={config.triggerText}
                  onChange={(e) => updateConfig('triggerText', e.target.value)}
                  placeholder="sudo ./hack_nsa.sh"
                  className={`${inputCls} font-mono`}
                  style={{ color: activeColor.hex }}
                />
              </div>

              {/* Vitesse */}
              <div>
                <label className={labelCls}>Vitesse de défilement</label>
                <select
                  value={config.typingSpeed}
                  onChange={(e) => updateConfig('typingSpeed', e.target.value)}
                  className={selectCls}
                >
                  <option value="slow">Lente — Réalisme</option>
                  <option value="fast">Rapide — Hacking</option>
                  <option value="instant">Instantanée</option>
                </select>
              </div>

              {/* Message final */}
              <div>
                <label className={labelCls}>Message final</label>
                <input
                  value={config.finalMessage}
                  onChange={(e) => updateConfig('finalMessage', e.target.value)}
                  className={inputCls}
                  placeholder="ex: ACCESS GRANTED"
                />
                <div className="flex gap-2 mt-2">
                  {(['success', 'error'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => updateConfig('finalStatus', status)}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-colors ${
                        config.finalStatus === status
                          ? status === 'success'
                            ? 'bg-emerald-900/50 border-emerald-600 text-emerald-300'
                            : 'bg-red-900/50 border-red-600 text-red-300'
                          : 'bg-[#1c1f26] border-[rgba(180,151,94,0.2)] text-[#5a5862]'
                      }`}
                    >
                      {status === 'success' ? 'SUCCESS' : 'ERROR'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.showProgressBar}
                    onChange={(e) => updateConfig('showProgressBar', e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#d1b374]"
                  />
                  <span className={labelCls.replace('mb-1.5', '')}>Barre de progression</span>
                </label>
                {config.showProgressBar && (
                  <div>
                    <label className={labelCls}>Durée (secondes)</label>
                    <input
                      type="number"
                      value={config.progressDuration}
                      onChange={(e) => updateConfig('progressDuration', parseInt(e.target.value))}
                      min={1}
                      max={60}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ─── Logs ─── */}
          <section className={`${sectionCls} flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={sectionTitleCls.replace('mb-4', '')} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                Lignes de log
              </h2>
              <button
                onClick={() => updateConfig('lines', generateFakeLogs())}
                className="flex items-center gap-1 text-xs text-[#d1b374] hover:text-[#e0c896] transition-colors"
              >
                <Sparkles size={11} /> Générer
              </button>
            </div>
            <textarea
              value={(config.lines || []).join('\n')}
              onChange={(e) => updateConfig('lines', e.target.value.split('\n'))}
              className="flex-1 min-h-80 w-full bg-[#090a0c] border border-[rgba(180,151,94,0.1)] rounded-lg p-3 text-xs font-mono resize-none outline-none"
              style={{ color: activeColor.hex, lineHeight: '1.7' }}
              placeholder={`INITIALIZING SEQUENCE...\nCONNECTING TO HOST...\nACCESS GRANTED`}
            />
          </section>
        </div>
      </div>
    </EditorShell>
  );
};
