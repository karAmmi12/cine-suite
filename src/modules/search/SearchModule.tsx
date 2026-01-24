import { useState, useEffect } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { useSceneStore } from '../../core/store/sceneStore';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';
import { type SearchModuleConfig } from '../../core/types/schema';
import { SearchResults } from './components/SearchResults';

export const SearchModule = () => {
  const scene = useSceneStore((state) => state.currentScene);
  const config = scene?.module as SearchModuleConfig;
  
  // State local pour savoir si on affiche les résultats
  const [showResults, setShowResults] = useState(false);

  // Notre Hook Magic Typing
  // Note: On désactive le typing si les résultats sont déjà affichés
  const { displayValue, isComplete } = useMagicTyping(config?.triggerText || "", !showResults);

  // Effet pour surveiller la touche "Entrée" et "F10"
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Si Entrée est pressé et que le texte est fini (ou presque), on lance la recherche
      if (e.key === 'Enter' && displayValue.length > 0) {
        setShowResults(true);
      }

      // HOT RESET : Touche F10 pour recommencer la prise
      if (e.key === 'F10') {
        e.preventDefault();
        setShowResults(false);
        window.location.reload(); // Solution brutale mais efficace pour vider le MagicTyping pour l'instant
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [displayValue]);

  // Auto-submit quand le typing est complet (uniquement sur mobile/tactile)
  useEffect(() => {
    // Détecte si c'est un appareil tactile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice && isComplete && displayValue.length > 0 && !showResults) {
      // Petit délai pour que l'utilisateur voie le texte complet
      const timer = setTimeout(() => setShowResults(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, displayValue, showResults]);

  if (!config) return <div className="bg-black h-screen w-screen" />;

  // --- RENDU : PAGE DE RÉSULTATS ---
  if (showResults) {
    return (
      <div className="h-screen w-full bg-white overflow-y-auto">
        {/* Header Fixe (Barre de recherche en haut) */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center shadow-sm z-10">
            <span className="text-xl font-bold mr-8" style={{ color: scene?.globalSettings?.accentColor }}>
                {config.brandName}
            </span>
            <div className="relative flex-1 max-w-2xl">
                <input 
                    type="text" 
                    readOnly 
                    value={config.triggerText} // Ici on affiche le texte complet
                    className="w-full h-11 pl-4 pr-10 rounded-full bg-white shadow-sm ring-1 ring-gray-200 text-gray-900 outline-none"
                />
                <X className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer border-l border-gray-300 pl-1" />
            </div>
        </div>

        {/* Liste des résultats */}
        <SearchResults results={config.results} />
      </div>
    );
  }

  // --- RENDU : PAGE D'ACCUEIL ---
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white text-gray-800 overflow-hidden">
      {/* --- LOGO --- */}
      <div className="mb-8">
        {config.brandLogoUrl ? (
          <img 
            src={config.brandLogoUrl} 
            alt="Logo" 
            className="h-24 object-contain max-w-75"
          />
        ) : (
          <h1 className="text-8xl font-bold tracking-tighter" style={{ color: scene?.globalSettings?.accentColor || '#4285F4' }}>
            {config.brandName}
          </h1>
        )}
      </div>

      <div className="w-full max-w-2xl px-4">
        <div className="relative flex items-center w-full h-14 rounded-full border border-gray-200 hover:shadow-lg focus-within:shadow-lg transition-shadow bg-white px-5 ring-1 ring-transparent focus-within:ring-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-4" />
          <div className="flex-1 text-xl font-medium text-gray-900 outline-none select-none">
            {displayValue}
            {!isComplete && (
              <span className="inline-block w-0.5 h-6 bg-blue-500 animate-pulse align-middle ml-0.5" />
            )}
          </div>
          <Mic className="w-5 h-5 text-blue-500 cursor-pointer ml-4" />
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button className="px-6 py-2 bg-gray-50 text-sm font-medium text-gray-700 rounded hover:bg-gray-100 transition-all">
            Recherche {config.brandName}
          </button>
        </div>
      </div>
    </div>
  );
};