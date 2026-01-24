import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash, Play, Download, Upload } from 'lucide-react';

// Imports internes
import { useSceneStore } from '../../../core/store/sceneStore';
import type { SearchModuleConfig, SearchResult } from '../../../core/types/schema';
import { downloadSceneConfig, readJsonFile } from '../../../core/utils/fileHandler';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';

export const SearchEditor = () => {
  const { currentScene, updateScene, loadScene } = useSceneStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
            <button onClick={addResult} className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={16} /> Ajouter un résultat
            </button>
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
                <button onClick={() => removeResult(result.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Supprimer">
                  <Trash size={16} />
                </button>
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
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};