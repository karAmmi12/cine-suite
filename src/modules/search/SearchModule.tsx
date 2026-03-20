import { useState, useEffect } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { useProjectStore } from '../../core/store/projectStore';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';
import type { SearchModuleConfig } from '../../core/types/schema';
import { SearchResults } from './components/SearchResults';
import { WebPageViewer } from './components/WebPageViewer';
import { getSearchTheme } from './searchThemes';

interface Props {
  config?: SearchModuleConfig;
  typingText?: string;
}

export const SearchModule = ({ config: propsConfig, typingText }: Props = {}) => {
  const scene = useProjectStore((state: any) => state.getCurrentScene());
  const config = propsConfig || (scene?.module as SearchModuleConfig);
  
  const [showResults, setShowResults] = useState(false);
  const [viewingResultId, setViewingResultId] = useState<string | null>(null);

  const trigger = typingText || config?.triggerText || '';
  const { displayValue, isComplete } = useMagicTyping(trigger, !showResults);

  const currentTheme = config?.theme || 'modern';

  // Afficher automatiquement les résultats quand la frappe est terminée
  useEffect(() => {
    if (isComplete && displayValue.length > 0 && !showResults) {
      const timer = setTimeout(() => setShowResults(true), 800); // Petit délai pour effet naturel
      return () => clearTimeout(timer);
    }
  }, [isComplete, displayValue, showResults]);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && displayValue.length > 0 && !showResults) {
        setShowResults(true);
      }
      if (e.key === 'F10') {
        e.preventDefault();
        window.location.reload();
      }
      if (e.key === 'Escape' && viewingResultId) {
          setViewingResultId(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [displayValue, showResults, viewingResultId]);

  if (!config) return <div className="bg-black h-screen w-screen" />;

  const themeConfig = getSearchTheme(currentTheme);
  const styles = {
    ...themeConfig.page,
    // Le thème modern utilise l'accentColor du projet si disponible
    logoColor: (currentTheme === 'modern' && scene?.globalSettings?.accentColor) || themeConfig.page.logoColor
  };

  // 1. MODE ARTICLE
  if (viewingResultId) {
      const result = config.results.find(r => r.id === viewingResultId);
      if (!result) return null;
      return <WebPageViewer result={result} theme={currentTheme} onBack={() => setViewingResultId(null)} />;
  }

  // 2. MODE RÉSULTATS
  if (showResults) {
    return (
      <div className={`h-screen w-full overflow-y-auto ${styles.resultsBg}`}>
        <div className={`sticky top-0 flex items-center z-10 ${styles.resultsHeader}`}>
            
            {/* Logo */}
            {config.brandLogoUrl ? (
                <img src={config.brandLogoUrl} className="h-8 object-contain mr-4" alt="logo" />
            ) : (
                <span 
                  className={`text-xl font-bold mr-4 ${currentTheme === 'windows-98' ? 'text-white' : currentTheme === 'hacker-terminal' ? 'text-green-500' : currentTheme === 'yahoo-2005' ? 'text-white' : currentTheme === 'retro-2000' ? 'text-white' : currentTheme === 'retro-90' ? 'font-serif italic text-black' : ''}`} 
                  style={{ color: currentTheme === 'modern' ? scene?.globalSettings?.accentColor : undefined }}
                >
                    {currentTheme === 'hacker-terminal' && '$ '}
                    {config.brandName}
                </span>
            )}
            
            {/* Input Search */}
            <div className={`relative flex-1 ${currentTheme === 'modern' ? 'max-w-2xl' : ''}`}>
                <input 
                    type="text" 
                    readOnly 
                    value={trigger}
                    className={`w-full outline-none ${styles.resultsInput}`}
                />
                {currentTheme === 'modern' && <X className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 cursor-pointer" />}
                {(currentTheme === 'retro-90' || currentTheme === 'windows-98') && (
                  <button className="absolute right-0 top-0 h-full px-2 bg-gray-300 border-l border-gray-500 text-xs font-bold">GO</button>
                )}
            </div>
        </div>

        <SearchResults 
            results={config.results} 
            query={trigger} 
            theme={currentTheme}
            onResultClick={(id) => setViewingResultId(id)}
        />
      </div>
    );
  }

  // 3. MODE ACCUEIL
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${styles.homeBg} ${styles.homeFont}`}>
      <div className="mb-8">
        {config.brandLogoUrl ? (
             <img src={config.brandLogoUrl} className="h-24 object-contain" alt="logo" />
        ) : (
            <h1 
              className={`text-8xl font-bold tracking-tighter select-none ${currentTheme === 'retro-90' || currentTheme === 'windows-98' ? 'italic' : ''}`} 
              style={{ color: styles.logoColor }}
            >
              {currentTheme === 'hacker-terminal' && '> '}
              {config.brandName}
              {currentTheme === 'hacker-terminal' && '_'}
            </h1>
        )}
        {currentTheme === 'retro-90' && <div className="text-center text-xs font-mono mt-2">Serving 4,203,102 pages since 1995</div>}
        {currentTheme === 'hacker-terminal' && <div className="text-center text-xs text-green-600 mt-2">// UNAUTHORIZED ACCESS DETECTED</div>}
      </div>

      <div className="w-full max-w-2xl px-4">
        <div className={`relative flex items-center w-full ${styles.searchBar}`}>
          {styles.searchIcon && <Search className="w-5 h-5 text-gray-400 mr-4" />}
          
          <div className={`flex-1 text-xl font-medium outline-none select-none ${currentTheme === 'hacker-terminal' ? 'text-green-500' : currentTheme === 'retro-90' ? 'font-mono' : 'text-gray-900'}`}>
            {currentTheme === 'hacker-terminal' && '> '}
            {displayValue}
            {!isComplete && (
              <span className={`inline-block animate-pulse align-middle ml-0.5 ${styles.cursor}`} />
            )}
          </div>
          
          {styles.searchIcon && <Mic className="w-5 h-5 text-blue-500 cursor-pointer ml-4" />}
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button className={`text-sm font-medium transition-all ${styles.button}`}>
            {currentTheme === 'hacker-terminal' ? '> SEARCH' : `Recherche ${config.brandName}`}
          </button>
        </div>
      </div>
    </div>
  );
};