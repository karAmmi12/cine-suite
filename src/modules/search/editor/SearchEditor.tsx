import { useRef } from 'react';
import { useState } from 'react';
import { generateSearchConfig } from '../../../core/services/configGeneratorService';
import { Link } from 'react-router-dom';
import {Sparkles, Loader2, Key, Plus, Trash, Play, Download, Upload, Image, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { LocalImagePicker } from '../../../ui/atoms/LocalImagePicker';

// Imports internes
import { useSceneStore } from '../../../core/store/sceneStore';
import type { SearchModuleConfig, SearchResult } from '../../../core/types/schema';
import { downloadSceneConfig, readJsonFile } from '../../../core/utils/fileHandler';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';

export const SearchEditor = () => {
  const { currentScene, updateScene, loadScene } = useSceneStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  
  // Sécurité : Si pas de scène ou mauvais type, on arrête
  if (!currentScene || currentScene.module.type !== 'search') {
    return <div className="p-8 text-red-500">Erreur : Aucune scène de recherche active.</div>;
  }

  const config = currentScene.module as SearchModuleConfig;

  // --- 1. LOGIQUE DE MISE À JOUR ---

  // Met à jour un champ direct (ex: brandName, triggerText)
  const updateConfig = (key: keyof SearchModuleConfig, value: any) => {
    updateScene({
      module: { ...config, [key]: value }
    });
  };

  // Met à jour la couleur globale (accentColor)
  const updateGlobalColor = (color: string) => {
    updateScene({
      globalSettings: { ...currentScene.globalSettings, accentColor: color }
    });
  };

  // Met à jour un résultat spécifique dans la liste
  const updateResult = (id: string, field: keyof SearchResult, value: string) => {
    const newResults = config.results.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    );
    updateConfig('results', newResults);
  };

  // Met à jour la configuration de la page d'un résultat
  const updateResultPageConfig = (id: string, pageConfigUpdates: any) => {
    const newResults = config.results.map(r => 
      r.id === id ? { 
        ...r, 
        pageConfig: { ...r.pageConfig, ...pageConfigUpdates } 
      } : r
    );
    updateConfig('results', newResults);
  };

  // Ajoute une image au contenu d'un résultat
  const addContentImage = (resultId: string) => {
    const result = config.results.find(r => r.id === resultId);
    const currentImages = result?.pageConfig?.contentImages || [];
    
    updateResultPageConfig(resultId, {
      contentImages: [...currentImages, {
        url: '/images/content/image1.jpg',
        caption: 'Légende de l\'image',
        position: 'inline',
        width: 'medium'
      }]
    });
  };

  // Supprime une image du contenu
  const removeContentImage = (resultId: string, imageIndex: number) => {
    const result = config.results.find(r => r.id === resultId);
    const currentImages = result?.pageConfig?.contentImages || [];
    
    updateResultPageConfig(resultId, {
      contentImages: currentImages.filter((_, idx) => idx !== imageIndex)
    });
  };

  // Met à jour une image spécifique
  const updateContentImage = (resultId: string, imageIndex: number, field: string, value: any) => {
    const result = config.results.find(r => r.id === resultId);
    const currentImages = result?.pageConfig?.contentImages || [];
    
    updateResultPageConfig(resultId, {
      contentImages: currentImages.map((img, idx) => 
        idx === imageIndex ? { ...img, [field]: value } : img
      )
    });
  };

  // Toggle expansion d'un résultat
  const toggleResultExpansion = (id: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedResults(newExpanded);
  };

  const handleAiGeneration = async () => {
    const apiKey = currentScene.globalSettings?.aiKey;
    if (!apiKey) {
      alert("⚠️ Veuillez d'abord entrer votre Clé API Groq en haut de page.");
      return;
    }
    if (!config.triggerText) {
        alert("⚠️ Entrez d'abord une phrase de recherche (Magic Typing).");
        return;
    }

    setIsGenerating(true);
    try {
      // Utilisation du SERVICE IA PROFESSIONNEL avec configuration complète
      const generatedConfig = await generateSearchConfig(config.triggerText, { apiKey });
      
      // On applique TOUTE la configuration générée par l'IA
      updateScene({ 
        module: { 
          ...config, 
          brandName: generatedConfig.brandName,
          results: generatedConfig.results 
        } 
      });
      
      alert(`✅ ${generatedConfig.results.length} résultats générés par l'IA professionnelle !`);
    } catch (err: any) {
      alert("❌ Erreur IA : " + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajoute un nouveau résultat vide
  const addResult = () => {
    const newResult: SearchResult = {
      id: Date.now().toString(),
      type: 'organic',
      title: 'Nouveau Résultat',
      url: 'https://exemple.com',
      snippet: 'Description du résultat...'
    };
    updateConfig('results', [...config.results, newResult]);
  };

  // Supprime un résultat
  const removeResult = (id: string) => {
    updateConfig('results', config.results.filter(r => r.id !== id));
  };

  // --- 2. LOGIQUE IMPORT / EXPORT ---

  const handleExport = () => {
    if (currentScene) downloadSceneConfig(currentScene);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newScene = await readJsonFile(file);
      // Petite sécurité pour être sûr qu'on charge un JSON valide
      if (newScene.module.type !== 'search') {
        alert("Attention : Ce fichier ne semble pas être une scène de Recherche.");
      }
      loadScene(newScene);
      // Reset de l'input pour pouvoir réimporter le même fichier si besoin
      e.target.value = ''; 
    } catch (err) {
      alert("Erreur lors du chargement : " + err);
    }
  };

  // --- 3. RENDU VISUEL ---

  return (
    <div className="h-screen bg-gray-50 text-gray-900 font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 pb-32">
        
        {/* === HEADER (Barre d'outils) === */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">CineSuite Studio</h1>
            <p className="text-xs text-blue-600 uppercase tracking-wider font-bold">Éditeur de Recherche</p>
          </div>
          
          <div className="flex gap-2">
            {/* Input fichier caché */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 border border-gray-200 mr-2">
                <Key size={14} className="text-gray-400"/>
                <input 
                    type="password" 
                    placeholder="Clé API Groq..."
                    value={currentScene.globalSettings?.aiKey || ''}
                    onChange={(e) => updateScene({ globalSettings: { ...currentScene.globalSettings, aiKey: e.target.value } })}
                    className="bg-transparent border-none outline-none text-xs w-24 focus:w-48 transition-all"
                />
            </div>

            <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors" title="Importer JSON">
              <Upload size={16} /> <span className="hidden sm:inline">Importer</span>
            </button>
            
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors" title="Exporter JSON">
              <Download size={16} /> <span className="hidden sm:inline">Exporter</span>
            </button>

            <div className="w-px h-8 bg-gray-300 mx-2"></div>

            <Link to="/" target="_blank" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 text-sm font-bold transition-all">
              <Play size={16} /> VOIR LE RÉSULTAT
            </Link>
          </div>
        </div>

        {/* === CONFIGURATION GÉNÉRALE === */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Paramètres du Moteur</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Colonne Gauche : Logo */}
            <div className="w-full md:w-1/3">
                <ImagePicker 
                  label="Logo du Moteur"
                  value={config.brandLogoUrl}
                  onChange={(val) => updateConfig('brandLogoUrl', val)} 
                />
            </div>

            {/* Colonne Droite : Textes */}
            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom (si pas de logo)</label>
                        <input 
                            type="text" 
                            value={config.brandName}
                            onChange={(e) => updateConfig('brandName', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Couleur Principale</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={currentScene.globalSettings?.accentColor || '#3b82f6'}
                                onChange={(e) => updateGlobalColor(e.target.value)}
                                className="h-10 w-14 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-400">{currentScene.globalSettings?.accentColor || '#3b82f6'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">🎨 Style Visuel (Époque Internet)</label>
                    <select 
                        value={config.theme || 'modern'}
                        onChange={(e) => updateConfig('theme', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                        <optgroup label="🌐 Moderne">
                            <option value="modern">Google/Bing (2020+) - Minimaliste</option>
                        </optgroup>
                        <optgroup label="💾 Années 2000">
                            <option value="retro-2000">Ask Jeeves (2004) - Portail bleu</option>
                            <option value="yahoo-2005">Yahoo! (2005) - Portail violet</option>
                        </optgroup>
                        <optgroup label="🖥️ Années 90">
                            <option value="altavista-98">AltaVista (1998) - Web 1.5</option>
                            <option value="windows-98">Style Windows 98 - Interface système</option>
                            <option value="retro-90">Lycos/Excite (1995) - Web 1.0 Brut</option>
                        </optgroup>
                        <optgroup label="🎭 Styles spéciaux">
                            <option value="hacker-terminal">Terminal Hacker - Matrix style</option>
                        </optgroup>
                    </select>
                    <p className="text-xs text-gray-400 mt-1 italic">
                        {config.theme === 'retro-90' && '→ Gris système, bordures 3D, police Courier, icônes pixelisées'}
                        {config.theme === 'windows-98' && '→ Interface Windows 98, boutons relief, fond gris'}
                        {config.theme === 'altavista-98' && '→ Fond blanc/jaune, liens bleus, design structuré'}
                        {config.theme === 'retro-2000' && '→ Bleu dominant, navigation claire, style portail'}
                        {config.theme === 'yahoo-2005' && '→ Violet Yahoo!, colonnes multiples, logo stylisé'}
                        {config.theme === 'hacker-terminal' && '→ Fond noir, texte vert phosphore, ASCII art'}
                        {(!config.theme || config.theme === 'modern') && '→ Interface épurée, Material Design, blanc dominant'}
                    </p>
                </div>

                <div className="col-span-2">
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phrase Scénario (Magic Typing)</label>
                    <input 
                        type="text" 
                        value={config.triggerText}
                        onChange={(e) => updateConfig('triggerText', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all font-mono text-sm"
                        placeholder="Ce que l'acteur va 'taper'..."
                    />
                </div>
            </div>
          </div>
        </div>

        {/* === LISTE DES RÉSULTATS === */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Résultats de recherche ({config.results.length})</h2>
            <div className="flex gap-2">
                {/* BOUTON IA */}
                <button 
                    onClick={handleAiGeneration} 
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 text-sm font-bold px-4 py-1.5 rounded-lg transition-all shadow-md shadow-purple-200 disabled:opacity-70"
                >
                {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />} 
                {isGenerating ? 'Invention en cours...' : 'Générer par IA'}
                </button>

                {/* Bouton Manuel Classique */}
                <button onClick={addResult} className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> Manuel
                </button>
          </div>
          </div>

          {config.results.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                  Aucun résultat. Cliquez sur "Ajouter" pour commencer.
              </div>
          )}

          {config.results.map((result, index) => (
            <div key={result.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group">
              <div className="flex justify-between mb-4 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{result.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleResultExpansion(result.id)}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded flex items-center gap-1" 
                    title="Configurer la page web"
                  >
                    {expandedResults.has(result.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <Settings size={14} />
                  </button>
                  <button onClick={() => removeResult(result.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Supprimer">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Titre */}
                <input 
                  value={result.title} 
                  onChange={(e) => updateResult(result.id, 'title', e.target.value)}
                  placeholder="Titre de l'article (ex: Le scandale éclate)"
                  className="w-full font-medium text-lg text-blue-700 placeholder-blue-200 outline-none border-b border-transparent focus:border-blue-100 transition-colors"
                />
                
                {/* URL */}
                <input 
                  value={result.url} 
                  onChange={(e) => updateResult(result.id, 'url', e.target.value)}
                  placeholder="URL (ex: https://lemonde.fr/...)"
                  className="w-full text-sm text-green-700 placeholder-green-200 outline-none"
                />
                
                {/* Description */}
                <textarea 
                  value={result.snippet} 
                  onChange={(e) => updateResult(result.id, 'snippet', e.target.value)}
                  placeholder="Description affichée sous le lien..."
                  className="w-full text-sm text-gray-600 placeholder-gray-300 resize-none outline-none bg-gray-50 p-2 rounded focus:bg-white focus:ring-1 focus:ring-blue-200 transition-colors"
                  rows={2}
                />
                <textarea 
                  value={result.pageContent || ''} 
                  onChange={(e) => updateResult(result.id, 'pageContent', e.target.value)}
                  placeholder="[PAGE WEB] Contenu complet de l'article quand on clique dessus..."
                  className="w-full text-sm text-gray-800 font-mono bg-gray-100 p-2 rounded mt-2 border-t-2 border-gray-200 h-32"
                />
              </div>

              {/* SECTION CONFIGURATION AVANCÉE */}
              {expandedResults.has(result.id) && (
                <div className="mt-6 pt-6 border-t-2 border-blue-100 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 -mx-5 -mb-5 p-5 rounded-b-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Settings size={16} className="text-blue-600" />
                      Configuration de la page web
                    </h3>
                    <button 
                      onClick={() => toggleResultExpansion(result.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <ChevronUp size={14} /> Masquer
                    </button>
                  </div>

                  {/* Style de la page */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Type de page</label>
                      <select 
                        value={result.pageConfig?.layout || 'article'}
                        onChange={(e) => updateResultPageConfig(result.id, { layout: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="article">📰 Article de presse (standard)</option>
                        <option value="blog">✍️ Blog personnel (border gauche)</option>
                        <option value="news">📢 Site d'actualités (colonnes, titre large)</option>
                        <option value="forum">💬 Forum/Discussion (compact, gris)</option>
                        <option value="wiki">📚 Wiki/Documentation (large, serif)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1 italic">
                        {result.pageConfig?.layout === 'blog' && 'Style personnel avec bordure colorée à gauche'}
                        {result.pageConfig?.layout === 'news' && 'Mise en page journal avec grandes colonnes'}
                        {result.pageConfig?.layout === 'forum' && 'Format discussion compacte avec fond gris'}
                        {result.pageConfig?.layout === 'wiki' && 'Style encyclopédique avec police serif'}
                        {(!result.pageConfig?.layout || result.pageConfig?.layout === 'article') && 'Format classique pour articles de presse'}
                      </p>
                    </div>
                  </div>

                  {/* Options de style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Police</label>
                      <select 
                        value={result.pageConfig?.style?.font || 'sans-serif'}
                        onChange={(e) => updateResultPageConfig(result.id, { 
                          style: { ...result.pageConfig?.style, font: e.target.value }
                        })}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="sans-serif">Sans-serif (moderne)</option>
                        <option value="serif">Serif (classique)</option>
                        <option value="mono">Mono (technique)</option>
                        <option value="cursive">Cursive (créatif)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Taille texte</label>
                      <select 
                        value={result.pageConfig?.style?.textSize || 'medium'}
                        onChange={(e) => updateResultPageConfig(result.id, { 
                          style: { ...result.pageConfig?.style, textSize: e.target.value }
                        })}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="small">Petit</option>
                        <option value="medium">Moyen</option>
                        <option value="large">Grand</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Espacement</label>
                      <select 
                        value={result.pageConfig?.style?.spacing || 'normal'}
                        onChange={(e) => updateResultPageConfig(result.id, { 
                          style: { ...result.pageConfig?.style, spacing: e.target.value }
                        })}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="relaxed">Relaxé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Couleur principale</label>
                      <input 
                        type="color"
                        value={result.pageConfig?.style?.primaryColor || '#2563eb'}
                        onChange={(e) => updateResultPageConfig(result.id, { 
                          style: { ...result.pageConfig?.style, primaryColor: e.target.value }
                        })}
                        className="w-full h-10 border rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Sidebar</label>
                      <select 
                        value={result.pageConfig?.sidebar?.type || 'none'}
                        onChange={(e) => updateResultPageConfig(result.id, { 
                          sidebar: { ...result.pageConfig?.sidebar, type: e.target.value }
                        })}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="none">Aucune</option>
                        <option value="author">Auteur</option>
                        <option value="related">Articles liés</option>
                        <option value="ads">Publicités</option>
                        <option value="toc">Table des matières</option>
                      </select>
                    </div>
                  </div>

                  {/* Image de bannière */}
                  <div>
                    <LocalImagePicker
                      label="Image de bannière (en-tête)"
                      value={result.pageConfig?.headerImage || ''}
                      onChange={(path) => updateResultPageConfig(result.id, { headerImage: path })}
                      category="header"
                    />
                  </div>

                  {/* Images du contenu */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-600">Images du contenu</label>
                      <button 
                        onClick={() => addContentImage(result.id)}
                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        <Image size={12} /> Ajouter
                      </button>
                    </div>

                    {result.pageConfig?.contentImages && result.pageConfig.contentImages.length > 0 ? (
                      <div className="space-y-3">
                        {result.pageConfig.contentImages.map((img, imgIdx) => (
                          <div key={imgIdx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-500">Image {imgIdx + 1}</span>
                              <button 
                                onClick={() => removeContentImage(result.id, imgIdx)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                <Trash size={12} />
                              </button>
                            </div>

                            <LocalImagePicker
                              label={`Image ${imgIdx + 1}`}
                              value={img.url}
                              onChange={(path) => updateContentImage(result.id, imgIdx, 'url', path)}
                              category="content"
                            />

                            <input 
                              type="text"
                              value={img.caption || ''}
                              onChange={(e) => updateContentImage(result.id, imgIdx, 'caption', e.target.value)}
                              placeholder="Légende (optionnelle)"
                              className="w-full text-xs border border-gray-300 rounded p-1.5 mt-2"
                            />

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <select 
                                value={img.position || 'inline'}
                                onChange={(e) => updateContentImage(result.id, imgIdx, 'position', e.target.value)}
                                className="text-xs border border-gray-300 rounded p-1.5 bg-white"
                              >
                                <option value="top">En haut</option>
                                <option value="inline">Dans le texte</option>
                                <option value="side">Côté (flottante)</option>
                                <option value="bottom">En bas</option>
                              </select>

                              <select 
                                value={img.width || 'medium'}
                                onChange={(e) => updateContentImage(result.id, imgIdx, 'width', e.target.value)}
                                className="text-xs border border-gray-300 rounded p-1.5 bg-white"
                              >
                                <option value="small">Petit (256px)</option>
                                <option value="medium">Moyen (384px)</option>
                                <option value="large">Grand (max)</option>
                                <option value="full">Pleine largeur</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-4 bg-white rounded-lg border border-dashed border-gray-200">
                        Aucune image. Cliquez sur "Ajouter" pour insérer des images dans l'article.
                      </p>
                    )}
                  </div>

                  {/* Métadonnées */}
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text"
                      value={result.pageConfig?.metadata?.category || ''}
                      onChange={(e) => updateResultPageConfig(result.id, { 
                        metadata: { ...result.pageConfig?.metadata, category: e.target.value }
                      })}
                      placeholder="Catégorie (ex: Technologie)"
                      className="text-sm border border-gray-300 rounded-lg p-2 bg-white"
                    />

                    <input 
                      type="text"
                      value={result.pageConfig?.metadata?.views || ''}
                      onChange={(e) => updateResultPageConfig(result.id, { 
                        metadata: { ...result.pageConfig?.metadata, views: e.target.value }
                      })}
                      placeholder="Vues (ex: 12.5K)"
                      className="text-sm border border-gray-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};