import type { SearchResult } from "../../../core/types/schema";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  theme: 'modern' | 'retro-2000' | 'retro-90' | 'yahoo-2005' | 'altavista-98' | 'windows-98' | 'hacker-terminal';
  onResultClick: (id: string) => void;
}

export const SearchResults = ({ results, query, theme, onResultClick }: SearchResultsProps) => {
  
  // Configuration des styles par thème
  const getThemeStyles = (): {
    container: string;
    stats: string;
    url: string;
    title: string;
    snippet: string;
  } => {
    switch(theme) {
      case 'modern':
        return {
          container: 'bg-white font-sans',
          stats: 'text-gray-500 text-sm',
          url: 'text-green-700 text-sm',
          title: 'text-[#1a0dab] text-xl font-normal group-hover:underline',
          snippet: 'text-gray-600 text-sm'
        };
      
      case 'yahoo-2005':
        return {
          container: 'bg-white font-sans',
          stats: 'text-purple-700 text-sm font-bold bg-purple-50 p-2 rounded',
          url: 'text-green-600 text-xs font-bold',
          title: 'text-purple-900 text-lg font-bold group-hover:underline',
          snippet: 'text-gray-700 text-sm'
        };
      
      case 'retro-2000':
        return {
          container: 'bg-[#f0f4ff] font-sans',
          stats: 'text-blue-800 text-sm font-medium bg-blue-100 px-3 py-1 inline-block border-l-4 border-blue-600',
          url: 'text-blue-600 text-xs underline',
          title: 'text-blue-900 text-lg font-semibold group-hover:text-blue-600',
          snippet: 'text-gray-800 text-sm'
        };
      
      case 'altavista-98':
        return {
          container: 'bg-[#ffffcc] font-sans',
          stats: 'text-black text-sm font-mono bg-yellow-200 px-2 py-1 border border-black',
          url: 'text-[#0000ee] text-sm underline font-mono',
          title: 'text-[#0000ee] text-xl underline font-bold',
          snippet: 'text-black text-sm leading-relaxed'
        };
      
      case 'windows-98':
        return {
          container: 'bg-[#c0c0c0] font-sans',
          stats: 'text-black text-sm bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1',
          url: 'text-blue-800 text-sm font-bold',
          title: 'text-navy text-lg font-bold underline',
          snippet: 'text-black text-sm bg-white p-2 border border-gray-500'
        };
      
      case 'retro-90':
        return {
          container: 'bg-[#c0c0c0] font-serif',
          stats: 'text-red-700 text-sm font-mono bg-gray-200 px-2 py-1 border-2 border-black',
          url: 'text-green-800 text-sm font-mono',
          title: 'text-blue-800 text-xl underline font-black',
          snippet: 'text-black text-base'
        };
      
      case 'hacker-terminal':
        return {
          container: 'bg-black font-mono',
          stats: 'text-green-500 text-xs border border-green-500 px-2 py-1 inline-block',
          url: 'text-green-400 text-xs',
          title: 'text-green-500 text-lg font-bold',
          snippet: 'text-green-300 text-sm opacity-80'
        };
      
      default:
        return {
          container: 'bg-white font-sans',
          stats: 'text-gray-500 text-sm',
          url: 'text-green-700 text-sm',
          title: 'text-[#1a0dab] text-xl font-normal group-hover:underline',
          snippet: 'text-gray-600 text-sm'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`w-full min-h-full text-left pt-6 pl-4 md:pl-36 pr-4 pb-20 ${styles.container}`}>
      
      {/* Stats Bar */}
      <div className={`mb-6 ${styles.stats}`}>
        {theme === 'hacker-terminal' && '> '}
        {theme === 'modern' ? `Environ ${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} résultats (${(Math.random() * 0.5).toFixed(2)} secondes)` : `Results for "${query}" - ${results.length} found`}
        {theme === 'hacker-terminal' && ' | press ESC to abort'}
      </div>

      <div className="max-w-162.5 space-y-6">
        {results.map((result, i) => (
          <div 
            key={result.id} 
            className={`group cursor-pointer ${theme === 'windows-98' ? 'bg-white border-2 border-t-white border-l-white border-r-gray-600 border-b-gray-600 p-3' : theme === 'hacker-terminal' ? 'border-l-2 border-green-500 pl-3' : ''}`}
            onClick={() => onResultClick(result.id)}
          >
            {/* Numérotation pour certains thèmes */}
            {(theme === 'retro-90' || theme === 'hacker-terminal') && (
              <div className={`text-xs ${theme === 'hacker-terminal' ? 'text-green-600' : 'text-gray-500'} mb-1`}>
                [{i + 1}]
              </div>
            )}

            {/* URL avec favicon */}
            <div className={`mb-1 flex items-center gap-2 ${styles.url}`}>
              {result.favicon && theme === 'modern' && (
                <img src={result.favicon} alt="" className="w-4 h-4 rounded-sm" />
              )}
              {theme === 'hacker-terminal' && '$ cat '}
              <span className="truncate">{result.url}</span>
              {/* Badge pour ads */}
              {result.type === 'ad' && theme === 'modern' && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-300 font-medium">
                  Annonce
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className={styles.title}>
              {result.title}
              {/* Badge prix pour e-commerce */}
              {result.price && (
                <span className="ml-3 text-base font-bold text-green-600">
                  {result.price}
                </span>
              )}
            </h3>

            {/* Snippet */}
            <p className={styles.snippet}>
              {result.snippet}
            </p>

            {/* Métadonnées additionnelles */}
            {theme === 'modern' && (
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                {result.date && <span>{result.date}</span>}
                {result.author && <span>Par {result.author}</span>}
                {result.readTime && <span>{result.readTime}</span>}
                {result.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span>{result.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bouton Windows 98 */}
            {theme === 'windows-98' && (
              <button className="mt-2 px-3 py-1 text-xs bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold">
                Open
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};