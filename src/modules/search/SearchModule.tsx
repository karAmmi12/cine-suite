import { useState, useEffect } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { useProjectStore } from '../../core/store/projectStore';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';
import type { SearchModuleConfig } from '../../core/types/schema';
import { SearchResults } from './components/SearchResults';
import { WebPageViewer } from './components/WebPageViewer';

export const SearchModule = () => {
  const scene = useProjectStore((state) => state.getCurrentScene());
  const config = scene?.module as SearchModuleConfig;
  
  const [showResults, setShowResults] = useState(false);
  const [viewingResultId, setViewingResultId] = useState<string | null>(null);

  const { displayValue, isComplete } = useMagicTyping(config?.triggerText || "", !showResults);

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

  // Configuration des styles par thème
  const getThemeStyles = () => {
    switch(currentTheme) {
      case 'modern':
        return {
          homeBg: 'bg-white',
          homeFont: 'font-sans',
          logoColor: scene?.globalSettings?.accentColor || '#4285F4',
          searchBar: 'h-14 rounded-full border border-gray-200 hover:shadow-lg px-5',
          searchIcon: true,
          cursor: 'w-0.5 h-6 bg-blue-500',
          button: 'px-6 py-2 bg-gray-50 rounded hover:bg-gray-100',
          resultsBg: 'bg-white',
          resultsHeader: 'bg-white border-b border-gray-200 px-4 py-3 shadow-sm',
          resultsInput: 'h-10 pl-4 pr-10 rounded-full bg-white shadow-sm ring-1 ring-gray-200'
        };
      
      case 'yahoo-2005':
        return {
          homeBg: 'bg-gradient-to-b from-purple-600 to-purple-800',
          homeFont: 'font-sans',
          logoColor: 'white',
          searchBar: 'h-12 border-2 border-purple-900 bg-white px-4 rounded-lg shadow-xl',
          searchIcon: false,
          cursor: 'w-1 h-6 bg-purple-600',
          button: 'px-6 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-600 shadow-lg',
          resultsBg: 'bg-purple-50',
          resultsHeader: 'bg-purple-700 border-b-4 border-purple-900 px-4 py-3',
          resultsInput: 'h-10 pl-4 pr-10 border-2 border-purple-900 bg-white rounded-lg'
        };
      
      case 'retro-2000':
        return {
          homeBg: 'bg-gradient-to-b from-blue-100 to-blue-200',
          homeFont: 'font-sans',
          logoColor: '#003399',
          searchBar: 'h-10 border-2 border-blue-800 bg-white px-3',
          searchIcon: false,
          cursor: 'w-1 h-5 bg-blue-800',
          button: 'px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-600 border border-blue-900',
          resultsBg: 'bg-blue-50',
          resultsHeader: 'bg-blue-700 border-b-2 border-blue-900 px-4 py-2',
          resultsInput: 'h-8 pl-3 border-2 border-blue-900 bg-white'
        };
      
      case 'altavista-98':
        return {
          homeBg: 'bg-[#ffffcc]',
          homeFont: 'font-sans',
          logoColor: '#0000ee',
          searchBar: 'h-10 border-2 border-black bg-white px-2',
          searchIcon: false,
          cursor: 'w-2 h-5 bg-black',
          button: 'px-4 py-2 bg-yellow-300 border-2 border-black font-bold hover:bg-yellow-200',
          resultsBg: 'bg-[#ffffcc]',
          resultsHeader: 'bg-[#ffff99] border-b-2 border-black px-4 py-2',
          resultsInput: 'h-8 pl-2 border-2 border-black bg-white font-mono'
        };
      
      case 'windows-98':
        return {
          homeBg: 'bg-[#008080]',
          homeFont: 'font-sans',
          logoColor: '#000080',
          searchBar: 'h-10 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white px-2',
          searchIcon: false,
          cursor: 'w-2 h-5 bg-black',
          button: 'px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white',
          resultsBg: 'bg-[#008080]',
          resultsHeader: 'bg-[#000080] border-b-2 border-white px-4 py-2',
          resultsInput: 'h-8 pl-2 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white'
        };
      
      case 'retro-90':
        return {
          homeBg: 'bg-[#c0c0c0]',
          homeFont: 'font-serif',
          logoColor: 'black',
          searchBar: 'h-10 border-2 border-gray-600 bg-white pl-2 text-black',
          searchIcon: false,
          cursor: 'w-3 h-5 bg-black',
          button: 'px-4 py-1 border-2 border-white border-r-black border-b-black bg-[#c0c0c0] active:border-t-black active:border-l-black',
          resultsBg: 'bg-[#c0c0c0]',
          resultsHeader: 'bg-[#cccccc] border-b-2 border-black p-2 gap-2',
          resultsInput: 'h-8 border-2 border-inset border-gray-500 bg-white pl-2 font-mono'
        };
      
      case 'hacker-terminal':
        return {
          homeBg: 'bg-black',
          homeFont: 'font-mono',
          logoColor: '#00ff00',
          searchBar: 'h-10 border border-green-500 bg-black px-3 text-green-500',
          searchIcon: false,
          cursor: 'w-2 h-5 bg-green-500',
          button: 'px-4 py-1 border border-green-500 text-green-500 hover:bg-green-900 font-mono',
          resultsBg: 'bg-black',
          resultsHeader: 'bg-black border-b border-green-500 px-4 py-2',
          resultsInput: 'h-8 pl-3 border border-green-500 bg-black text-green-500 font-mono'
        };
      
      default:
        return getThemeStyles();
    }
  };

  const styles = getThemeStyles();

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
                    value={config.triggerText}
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
            query={config.triggerText} 
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