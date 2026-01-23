import { type SearchResult } from "../../../core/types/schema";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export const SearchResults = ({ results, query }: SearchResultsProps) => {
  return (
    <div className="w-full min-h-screen bg-white text-left pt-6 pl-4 md:pl-36 pr-4 font-sans">
      {/* Barre de stats (Fake) */}
      <div className="text-gray-500 text-sm mb-6">
        Environ {Math.floor(Math.random() * 50000)} résultats (0,{(Math.random() * 0.9).toFixed(2)} secondes)
      </div>

      <div className="max-w-[650px] space-y-8">
        {results.map((result) => (
          <div key={result.id} className="group">
            {/* URL + Favicon simulé */}
            <div className="flex items-center text-sm mb-1">
              {result.type === 'ad' && (
                <span className="font-bold text-gray-900 mr-2">Annonce ·</span>
              )}
              <div className="flex flex-col">
                <span className="text-gray-800">{new URL(result.url).hostname}</span>
                <span className="text-gray-500 text-xs">{result.url}</span>
              </div>
            </div>

            {/* Titre (Bleu Google) */}
            <a href="#" className="block group-hover:underline">
              <h3 className="text-xl text-[#1a0dab] font-normal leading-6 mb-1">
                {result.title}
              </h3>
            </a>

            {/* Description (Snippet) */}
            <p className="text-sm text-gray-600 leading-normal">
              <span className="text-gray-500">{result.date ? `${result.date} — ` : ''}</span>
              {result.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};