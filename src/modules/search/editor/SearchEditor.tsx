import { useState } from 'react';
import { generateSearchConfig } from '../../../core/services/configGeneratorService';
import { Sparkles, Loader2, Plus, Trash, Image, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { LocalImagePicker } from '../../../ui/atoms/LocalImagePicker';
import { useEditorActions } from '../../../core/hooks/useEditorActions';
import type { SearchModuleConfig, SearchResult } from '../../../core/types/schema';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';
import { EditorShell } from '../../../ui/layout/EditorShell';

// --- Styles partagés ---
const inputCls = 'w-full bg-[#1c1f26] border border-[rgba(180,151,94,0.25)] rounded-lg px-3 py-2 text-sm text-[#ebe7df] placeholder-[#4a4840] outline-none focus:border-[#d1b374] transition-colors';
const labelCls = 'block text-[10px] font-semibold text-[#a9a49b] uppercase tracking-wider mb-1.5';
const sectionCls = 'bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl p-5 space-y-5';
const sectionTitleCls = 'text-[10px] font-semibold text-[#d1b374] uppercase tracking-widest border-b border-[rgba(180,151,94,0.15)] pb-2 mb-4';
const selectCls = `${inputCls} cursor-pointer bg-[#1c1f26]`;

const THEMES = [
  { value: 'modern',           label: 'Moderne (Google/Bing 2020+)' },
  { value: 'retro-2000',       label: 'Ask Jeeves (2004) — Portail bleu' },
  { value: 'yahoo-2005',       label: 'Yahoo! (2005) — Portail violet' },
  { value: 'altavista-98',     label: 'AltaVista (1998) — Web 1.5' },
  { value: 'windows-98',       label: 'Windows 98 — Interface système' },
  { value: 'retro-90',         label: 'Lycos/Excite (1995) — Web 1.0' },
  { value: 'hacker-terminal',  label: 'Terminal Hacker — Matrix' },
];

export const SearchEditor = () => {
  const { currentScene, updateCurrentScene } = useEditorActions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  if (!currentScene || currentScene.module.type !== 'search') return null;
  const config = currentScene.module as SearchModuleConfig;

  // --- Update helpers ---
  const updateConfig = (key: keyof SearchModuleConfig, value: any) => {
    updateCurrentScene({ module: { ...config, [key]: value } });
  };

  const updateGlobalColor = (color: string) => {
    updateCurrentScene({ globalSettings: { ...currentScene.globalSettings, accentColor: color } });
  };

  const updateResult = (id: string, field: keyof SearchResult, value: string) => {
    const results = config.results.map(r => r.id === id ? { ...r, [field]: value } : r);
    updateConfig('results', results);
  };

  const updateResultPageConfig = (id: string, patch: any) => {
    const results = config.results.map(r =>
      r.id === id ? { ...r, pageConfig: { ...r.pageConfig, ...patch } } : r
    );
    updateConfig('results', results);
  };

  const addContentImage = (resultId: string) => {
    const result = config.results.find(r => r.id === resultId);
    const imgs = result?.pageConfig?.contentImages || [];
    updateResultPageConfig(resultId, {
      contentImages: [...imgs, { url: '', caption: '', position: 'inline', width: 'medium' }]
    });
  };

  const removeContentImage = (resultId: string, idx: number) => {
    const result = config.results.find(r => r.id === resultId);
    const imgs = (result?.pageConfig?.contentImages || []).filter((_, i) => i !== idx);
    updateResultPageConfig(resultId, { contentImages: imgs });
  };

  const updateContentImage = (resultId: string, idx: number, field: string, value: any) => {
    const result = config.results.find(r => r.id === resultId);
    const imgs = (result?.pageConfig?.contentImages || []).map((img, i) =>
      i === idx ? { ...img, [field]: value } : img
    );
    updateResultPageConfig(resultId, { contentImages: imgs });
  };

  const toggleExpanded = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addResult = () => {
    const newResult: SearchResult = {
      id: Date.now().toString(),
      type: 'organic',
      title: 'Nouveau résultat',
      url: 'https://exemple.com',
      snippet: 'Description du résultat...'
    };
    updateConfig('results', [...config.results, newResult]);
  };

  const removeResult = (id: string) => {
    updateConfig('results', config.results.filter(r => r.id !== id));
  };

  const handleAiGeneration = async () => {
    const apiKey = currentScene.globalSettings?.aiKey;
    if (!apiKey) { alert('Clé API Groq manquante — cliquez sur 🔑 en haut.'); return; }
    if (!config.triggerText) { alert('Entrez une phrase de recherche (Magic Typing).'); return; }

    setIsGenerating(true);
    try {
      const generated = await generateSearchConfig(config.triggerText, { apiKey });
      updateCurrentScene({
        module: { ...config, brandName: generated.brandName, results: generated.results }
      });
    } catch (err: any) {
      alert('Erreur IA : ' + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <EditorShell>
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6 pb-24">

        {/* ─── Moteur de recherche ─── */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Moteur de recherche</h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-44 shrink-0">
              <label className={labelCls}>Logo</label>
              <ImagePicker
                label=""
                value={config.brandLogoUrl}
                onChange={(val) => updateConfig('brandLogoUrl', val)}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nom (sans logo)</label>
                  <input
                    type="text"
                    value={config.brandName}
                    onChange={(e) => updateConfig('brandName', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Couleur principale</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentScene.globalSettings?.accentColor || '#3b82f6'}
                      onChange={(e) => updateGlobalColor(e.target.value)}
                      className="h-9 w-12 rounded cursor-pointer border border-[rgba(180,151,94,0.25)] bg-transparent"
                    />
                    <span className="text-xs text-[#a9a49b] font-mono">
                      {currentScene.globalSettings?.accentColor || '#3b82f6'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Style visuel (époque)</label>
                <select
                  value={config.theme || 'modern'}
                  onChange={(e) => updateConfig('theme', e.target.value)}
                  className={selectCls}
                >
                  {THEMES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Phrase scénario — Magic Typing</label>
                <input
                  type="text"
                  value={config.triggerText}
                  onChange={(e) => updateConfig('triggerText', e.target.value)}
                  placeholder="Ce que l'acteur va « taper »..."
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Résultats ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#a9a49b] uppercase tracking-wider">
              Résultats ({config.results.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleAiGeneration}
                disabled={isGenerating}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {isGenerating ? 'Génération...' : 'Générer IA'}
              </button>
              <button
                onClick={addResult}
                className="flex items-center gap-1.5 cine-button-muted text-xs font-medium px-3 py-1.5 rounded-lg"
              >
                <Plus size={13} /> Manuel
              </button>
            </div>
          </div>

          {config.results.length === 0 && (
            <div className="text-center py-10 border border-dashed border-[rgba(180,151,94,0.2)] rounded-xl text-[#4a4840] text-sm">
              Aucun résultat. Cliquez sur « Manuel » ou « Générer IA ».
            </div>
          )}

          <div className="space-y-3">
            {config.results.map((result, index) => (
              <div key={result.id} className="bg-[#14161b] border border-[rgba(180,151,94,0.12)] rounded-xl overflow-hidden">

                {/* Result header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(180,151,94,0.08)]">
                  <span className="text-[10px] font-bold text-[#5a5862] bg-[#1c1f26] px-2 py-0.5 rounded">
                    #{index + 1}
                  </span>
                  <span className="text-[10px] font-semibold text-[#5a5862] uppercase tracking-wider">
                    {result.type}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => toggleExpanded(result.id)}
                    className="flex items-center gap-1 text-[#5a5862] hover:text-[#a9a49b] text-xs transition-colors px-2 py-1 rounded hover:bg-[#1c1f26]"
                  >
                    {expandedResults.has(result.id) ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <Settings size={12} />
                  </button>
                  <button
                    onClick={() => removeResult(result.id)}
                    className="text-[#4a4840] hover:text-[#dc6f6f] p-1 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>

                {/* Result fields */}
                <div className="p-4 space-y-3">
                  <input
                    value={result.title}
                    onChange={(e) => updateResult(result.id, 'title', e.target.value)}
                    placeholder="Titre de l'article"
                    className="w-full bg-transparent text-[#ebe7df] text-base font-medium outline-none border-b border-transparent focus:border-[rgba(180,151,94,0.3)] pb-1 transition-colors placeholder-[#3a3830]"
                  />
                  <input
                    value={result.url}
                    onChange={(e) => updateResult(result.id, 'url', e.target.value)}
                    placeholder="https://exemple.com/article"
                    className="w-full bg-transparent text-xs text-[#73b18f] outline-none placeholder-[#3a3830]"
                  />
                  <textarea
                    value={result.snippet}
                    onChange={(e) => updateResult(result.id, 'snippet', e.target.value)}
                    placeholder="Description affichée sous le lien..."
                    rows={2}
                    className="w-full bg-[#1c1f26] rounded-lg px-3 py-2 text-sm text-[#a9a49b] placeholder-[#3a3830] outline-none resize-none focus:border focus:border-[rgba(180,151,94,0.3)] transition-colors"
                  />
                  <textarea
                    value={result.pageContent || ''}
                    onChange={(e) => updateResult(result.id, 'pageContent', e.target.value)}
                    placeholder="[Contenu page web] Texte complet de l'article quand on clique dessus..."
                    rows={3}
                    className="w-full bg-[#0d0f12] border border-[rgba(180,151,94,0.12)] rounded-lg px-3 py-2 text-xs text-[#a9a49b] font-mono placeholder-[#3a3830] outline-none resize-y"
                  />
                </div>

                {/* Advanced config (expandable) */}
                {expandedResults.has(result.id) && (
                  <div className="border-t border-[rgba(180,151,94,0.12)] bg-[#0d0f12]/50 p-4 space-y-5">
                    <p className="text-[10px] font-semibold text-[#d1b374] uppercase tracking-widest flex items-center gap-2">
                      <Settings size={11} /> Configuration de la page web
                    </p>

                    {/* Layout & style */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Type de page</label>
                        <select
                          value={result.pageConfig?.layout || 'article'}
                          onChange={(e) => updateResultPageConfig(result.id, { layout: e.target.value })}
                          className={selectCls}
                        >
                          <option value="article">Article de presse</option>
                          <option value="blog">Blog personnel</option>
                          <option value="news">Site d'actualités</option>
                          <option value="forum">Forum / Discussion</option>
                          <option value="wiki">Wiki / Documentation</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Police</label>
                        <select
                          value={result.pageConfig?.style?.font || 'sans-serif'}
                          onChange={(e) => updateResultPageConfig(result.id, { style: { ...result.pageConfig?.style, font: e.target.value } })}
                          className={selectCls}
                        >
                          <option value="sans-serif">Sans-serif</option>
                          <option value="serif">Serif</option>
                          <option value="mono">Mono</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Sidebar</label>
                        <select
                          value={result.pageConfig?.sidebar?.type || 'none'}
                          onChange={(e) => updateResultPageConfig(result.id, { sidebar: { ...result.pageConfig?.sidebar, type: e.target.value } })}
                          className={selectCls}
                        >
                          <option value="none">Aucune</option>
                          <option value="author">Auteur</option>
                          <option value="related">Articles liés</option>
                          <option value="ads">Publicités</option>
                          <option value="toc">Table des matières</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Catégorie</label>
                        <input
                          type="text"
                          value={result.pageConfig?.metadata?.category || ''}
                          onChange={(e) => updateResultPageConfig(result.id, { metadata: { ...result.pageConfig?.metadata, category: e.target.value } })}
                          placeholder="ex: Technologie"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Header image */}
                    <div>
                      <label className={labelCls}>Image de bannière</label>
                      <LocalImagePicker
                        label=""
                        value={result.pageConfig?.headerImage || ''}
                        onChange={(path) => updateResultPageConfig(result.id, { headerImage: path })}
                        category="header"
                      />
                    </div>

                    {/* Content images */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className={labelCls}>Images dans l'article</label>
                        <button
                          onClick={() => addContentImage(result.id)}
                          className="flex items-center gap-1 text-xs text-[#d1b374] hover:text-[#e0c896] transition-colors"
                        >
                          <Image size={11} /> Ajouter
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(result.pageConfig?.contentImages || []).map((img, imgIdx) => (
                          <div key={imgIdx} className="bg-[#14161b] rounded-lg p-3 space-y-2 border border-[rgba(180,151,94,0.1)]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#5a5862] uppercase tracking-wider">Image {imgIdx + 1}</span>
                              <button onClick={() => removeContentImage(result.id, imgIdx)} className="text-[#4a4840] hover:text-[#dc6f6f]">
                                <Trash size={12} />
                              </button>
                            </div>
                            <LocalImagePicker
                              label=""
                              value={img.url}
                              onChange={(path) => updateContentImage(result.id, imgIdx, 'url', path)}
                              category="content"
                            />
                            <input
                              type="text"
                              value={img.caption || ''}
                              onChange={(e) => updateContentImage(result.id, imgIdx, 'caption', e.target.value)}
                              placeholder="Légende (optionnelle)"
                              className={inputCls}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={img.position || 'inline'}
                                onChange={(e) => updateContentImage(result.id, imgIdx, 'position', e.target.value)}
                                className={selectCls}
                              >
                                <option value="top">En haut</option>
                                <option value="inline">Dans le texte</option>
                                <option value="side">Côté</option>
                                <option value="bottom">En bas</option>
                              </select>
                              <select
                                value={img.width || 'medium'}
                                onChange={(e) => updateContentImage(result.id, imgIdx, 'width', e.target.value)}
                                className={selectCls}
                              >
                                <option value="small">Petit</option>
                                <option value="medium">Moyen</option>
                                <option value="large">Grand</option>
                                <option value="full">Pleine largeur</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </EditorShell>
  );
};
