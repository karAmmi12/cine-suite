import type { SearchResult } from "../../../core/types/schema";
import { getSearchTheme, type SearchTheme } from '../searchThemes';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  theme: SearchTheme;
  onResultClick: (id: string) => void;
}

export const SearchResults = ({ results, query, theme, onResultClick }: SearchResultsProps) => {
  
  const styles = getSearchTheme(theme).results;

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