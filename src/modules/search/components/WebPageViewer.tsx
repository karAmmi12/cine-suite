import type { SearchResult } from "../../../core/types/schema";
import { ArrowLeft, X, Calendar, User, Clock, Eye, MessageCircle, Tag } from 'lucide-react';

interface WebPageViewerProps {
  result: SearchResult;
  theme: 'modern' | 'retro-2000' | 'retro-90' | 'yahoo-2005' | 'altavista-98' | 'windows-98' | 'hacker-terminal';
  onBack: () => void;
}

export const WebPageViewer = ({ result, theme, onBack }: WebPageViewerProps) => {
  
  // Configuration par thème
  const getThemeConfig = (): {
    bg: string;
    header: string;
    headerText: string;
    button: string;
    title: string;
    date: string;
    body: string;
    container: string;
    font: string;
  } => {
    switch(theme) {
      case 'modern':
        return {
          bg: 'bg-white',
          header: 'bg-white border-gray-200 shadow-sm',
          headerText: 'text-gray-500',
          button: 'text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full',
          title: 'text-3xl font-bold text-gray-900',
          date: 'text-gray-500 text-sm',
          body: 'text-gray-800 prose-slate',
          container: 'bg-white',
          font: 'font-sans'
        };
      
      case 'yahoo-2005':
        return {
          bg: 'bg-purple-50',
          header: 'bg-purple-700 text-white border-b-4 border-purple-900',
          headerText: 'text-purple-100',
          button: 'bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500 font-bold',
          title: 'text-2xl font-black text-purple-900 uppercase',
          date: 'text-purple-700 text-xs font-bold',
          body: 'text-gray-900 leading-relaxed',
          container: 'bg-white border-4 border-purple-300 p-6',
          font: 'font-sans'
        };
      
      case 'retro-2000':
        return {
          bg: 'bg-blue-50',
          header: 'bg-blue-700 text-white border-b-2 border-blue-900',
          headerText: 'text-blue-100',
          button: 'bg-blue-600 text-white px-3 py-1 hover:bg-blue-500 font-semibold',
          title: 'text-2xl font-bold text-blue-900',
          date: 'text-blue-600 text-sm',
          body: 'text-gray-900',
          container: 'bg-white border border-blue-300 p-6',
          font: 'font-sans'
        };
      
      case 'altavista-98':
        return {
          bg: 'bg-[#ffffcc]',
          header: 'bg-[#ffff99] border-b-2 border-black',
          headerText: 'text-black font-mono',
          button: 'bg-yellow-300 text-black px-2 py-1 border-2 border-black font-bold',
          title: 'text-3xl font-black text-[#0000ee] underline',
          date: 'text-black text-xs font-mono bg-yellow-200 px-2',
          body: 'text-black font-serif leading-loose',
          container: 'bg-white border-4 border-black p-6',
          font: 'font-sans'
        };
      
      case 'windows-98':
        return {
          bg: 'bg-[#008080]',
          header: 'bg-[#000080] text-white border-b-2 border-white',
          headerText: 'text-white font-bold',
          button: 'bg-[#c0c0c0] text-black px-2 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold text-xs',
          title: 'text-2xl font-bold text-navy',
          date: 'text-gray-700 text-xs',
          body: 'text-black',
          container: 'bg-white border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 m-2',
          font: 'font-sans'
        };
      
      case 'retro-90':
        return {
          bg: 'bg-[#c0c0c0]',
          header: 'bg-[#000080] text-white border-b-4 border-gray-400',
          headerText: 'text-yellow-300 font-mono',
          button: 'bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black',
          title: 'text-4xl font-black text-red-600 underline',
          date: 'text-green-700 font-mono text-xs',
          body: 'text-black font-serif leading-loose',
          container: 'bg-white border-2 border-black m-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6',
          font: 'font-serif'
        };
      
      case 'hacker-terminal':
        return {
          bg: 'bg-black',
          header: 'bg-black border-b border-green-500',
          headerText: 'text-green-500 font-mono',
          button: 'text-green-400 hover:text-green-300 px-2 border border-green-500 font-mono text-xs',
          title: 'text-2xl font-bold text-green-500 font-mono',
          date: 'text-green-600 text-xs font-mono',
          body: 'text-green-300 font-mono leading-relaxed',
          container: 'bg-black border border-green-500 p-6 m-4',
          font: 'font-mono'
        };
      
      default:
        return {
          bg: 'bg-white',
          header: 'bg-white border-gray-200 shadow-sm',
          headerText: 'text-gray-500',
          button: 'text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full',
          title: 'text-3xl font-bold text-gray-900',
          date: 'text-gray-500 text-sm',
          body: 'text-gray-800 prose-slate',
          container: 'bg-white',
          font: 'font-sans'
        };
    }
  };

  const config = getThemeConfig();
  const pageConfig = result.pageConfig || {};
  const style = pageConfig.style || {};
  const layout = pageConfig.layout || 'article';

  // Fonction pour obtenir les styles spécifiques au layout
  const getLayoutStyles = () => {
    switch(layout) {
      case 'blog':
        return {
          container: 'max-w-3xl',
          titleSize: 'text-4xl',
          headerStyle: 'border-l-4 border-blue-500 pl-6',
          contentSpacing: 'space-y-6',
          imageStyle: 'rounded-2xl shadow-2xl',
        };
      case 'news':
        return {
          container: 'max-w-5xl',
          titleSize: 'text-5xl font-black',
          headerStyle: 'border-b-4 border-red-600 pb-4',
          contentSpacing: 'space-y-4 columns-2 gap-8',
          imageStyle: 'shadow-xl',
        };
      case 'forum':
        return {
          container: 'max-w-4xl',
          titleSize: 'text-2xl',
          headerStyle: 'bg-gray-100 p-4 rounded-lg',
          contentSpacing: 'space-y-3 text-sm',
          imageStyle: 'border-2 border-gray-300',
        };
      case 'wiki':
        return {
          container: 'max-w-6xl',
          titleSize: 'text-3xl font-serif',
          headerStyle: 'border-b border-gray-300 pb-2',
          contentSpacing: 'space-y-4 leading-loose',
          imageStyle: 'border border-gray-200',
        };
      default: // article
        return {
          container: 'max-w-4xl',
          titleSize: 'text-4xl',
          headerStyle: '',
          contentSpacing: 'space-y-5',
          imageStyle: 'rounded-lg shadow-lg',
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  // Fonction pour rendre la sidebar
  const renderSidebar = () => {
    if (!pageConfig.sidebar || pageConfig.sidebar.type === 'none') return null;
    
    const sidebarType = pageConfig.sidebar.type;
    
    return (
      <aside className={`w-80 flex-shrink-0 ${theme === 'modern' ? 'ml-8' : 'ml-4'}`}>
        <div className={`sticky top-20 ${
          theme === 'modern' ? 'bg-gray-50 rounded-xl p-6' :
          theme === 'retro-90' || theme === 'windows-98' ? 'bg-[#c0c0c0] border-2 border-black p-4' :
          theme === 'altavista-98' ? 'bg-[#ffff99] border-2 border-black p-4' :
          'bg-white border border-gray-200 p-4'
        }`}>
          {sidebarType === 'author' && (
            <div>
              <h3 className={`font-bold mb-3 ${config.title} text-lg`}>À propos de l'auteur</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-16 h-16 rounded-full ${theme === 'modern' ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-gray-400'} flex items-center justify-center text-white font-bold text-xl`}>
                  {result.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="font-semibold">{result.author || 'Auteur'}</div>
                  <div className={`text-xs ${config.date}`}>Journaliste</div>
                </div>
              </div>
              <p className={`text-sm ${config.body}`}>
                {pageConfig.sidebar.content || 'Journaliste spécialisé avec 10 ans d\'expérience dans le domaine.'}
              </p>
            </div>
          )}
          
          {sidebarType === 'related' && (
            <div>
              <h3 className={`font-bold mb-3 ${config.title} text-lg`}>Articles liés</h3>
              <ul className="space-y-3">
                {[1, 2, 3].map(i => (
                  <li key={i} className={`text-sm pb-3 border-b ${theme === 'modern' ? 'border-gray-200' : 'border-black'}`}>
                    <a href="#" className={`hover:underline ${config.body}`}>
                      Article connexe #{i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {sidebarType === 'ads' && (
            <div className="space-y-4">
              <div className={`${theme === 'modern' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg' : theme.includes('retro') || theme === 'windows-98' ? 'bg-yellow-300 border-4 border-red-600' : 'bg-yellow-100 border-2 border-yellow-400'} p-4 text-center`}>
                <div className={`font-black ${theme.includes('retro') ? 'text-2xl animate-pulse text-red-600' : 'text-lg'}`}>
                  {theme.includes('retro') || theme === 'windows-98' ? 'CLICK HERE!' : 'Publicité'}
                </div>
                <div className="text-xs mt-2">Annonce sponsorisée</div>
              </div>
            </div>
          )}
          
          {sidebarType === 'toc' && (
            <div>
              <h3 className={`font-bold mb-3 ${config.title} text-lg`}>Sommaire</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">Introduction</a></li>
                <li><a href="#" className="hover:underline">Développement</a></li>
                <li><a href="#" className="hover:underline">Conclusion</a></li>
              </ul>
            </div>
          )}
        </div>
      </aside>
    );
  };

  return (
    <div className={`min-h-full w-full flex flex-col ${config.bg} ${config.font}`}>
      
      {/* Header */}
      <div className={`border-b flex items-center px-4 py-2 gap-4 sticky top-0 z-10 ${config.header}`}>
        <button 
          onClick={onBack} 
          className={`flex items-center gap-1 text-sm ${config.button}`}
        >
          <ArrowLeft size={16} /> {theme === 'hacker-terminal' ? 'exit' : theme === 'windows-98' || theme.includes('retro') ? 'Back' : 'Retour'}
        </button>
        <div className={`flex-1 truncate text-sm ${config.headerText}`}>
          {theme === 'hacker-terminal' && '> '}
          {result.url}
        </div>
        <button onClick={onBack} className={config.button}>
            <X size={16}/>
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto`}>
        <div className={`flex ${pageConfig.sidebar && pageConfig.sidebar.type !== 'none' ? 'max-w-7xl mx-auto' : `${layoutStyles.container} mx-auto`} px-4 py-8`}>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className={config.container}>
              
              {/* Header Image */}
              {pageConfig.headerImage && (
                <div className="mb-8 -mx-6 -mt-6">
                  <img 
                    src={pageConfig.headerImage} 
                    alt={result.title}
                    className={`w-full ${theme === 'modern' ? 'h-96 object-cover' : 'h-64 object-cover'} ${
                      theme === 'retro-90' || theme === 'windows-98' ? 'border-b-4 border-black' :
                      theme === 'altavista-98' ? 'border-b-2 border-black' : layoutStyles.imageStyle
                    }`}
                  />
                </div>
              )}
              
              {/* Article header */}
              <div className={`mb-8 pb-6 ${layoutStyles.headerStyle} ${theme === 'modern' ? 'border-b border-gray-200' : theme.includes('retro') || theme === 'windows-98' || theme === 'altavista-98' ? 'border-b-2 border-black' : 'border-b'}`}>
                {theme === 'hacker-terminal' && <div className="text-green-600 text-xs mb-2">{'>'} FILE: {result.title.toLowerCase().replace(/\s+/g, '_')}.txt</div>}
                
                {/* Métadonnées enrichies */}
                {pageConfig.metadata && (
                  <div className={`flex flex-wrap gap-3 mb-4 text-xs ${config.date}`}>
                    {pageConfig.metadata.category && (
                      <span className={`${theme === 'modern' ? 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full' : theme.includes('retro') ? 'bg-yellow-300 border border-black px-2 py-1' : 'bg-gray-100 px-2 py-1'}`}>
                        {pageConfig.metadata.category}
                      </span>
                    )}
                    {pageConfig.metadata.tags?.map((tag, idx) => (
                      <span key={idx} className={`flex items-center gap-1 ${theme === 'modern' ? 'text-gray-500' : ''}`}>
                        <Tag size={12} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <h1 className={`mb-4 ${layoutStyles.titleSize} ${config.title} ${
                  style.textSize === 'large' ? 'text-5xl' :
                  style.textSize === 'small' ? 'text-2xl' :
                  ''
                }`} style={{ color: style.primaryColor }}>
                  {result.title}
                </h1>
                
                {/* Metadata bar */}
                <div className={`flex flex-wrap items-center gap-4 ${config.date}`}>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{theme === 'hacker-terminal' && '// '}Publié le {result.date || "24/09/2004"}</span>
                  </div>
                  {result.author && (
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>Par {result.author}</span>
                    </div>
                  )}
                  {result.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{result.readTime}</span>
                    </div>
                  )}
                  {pageConfig.metadata?.views && (
                    <div className="flex items-center gap-2">
                      <Eye size={14} />
                      <span>{pageConfig.metadata.views} vues</span>
                    </div>
                  )}
                  {pageConfig.metadata?.comments && (
                    <div className="flex items-center gap-2">
                      <MessageCircle size={14} />
                      <span>{pageConfig.metadata.comments} commentaires</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body avec images intégrées */}
              <div className={`prose max-w-none ${config.body} ${layoutStyles.contentSpacing} ${
                style.spacing === 'relaxed' ? 'leading-loose' :
                style.spacing === 'compact' ? 'leading-normal' :
                'leading-relaxed'
              } ${
                style.font === 'serif' ? 'font-serif' :
                style.font === 'mono' ? 'font-mono' :
                style.font === 'cursive' ? 'font-cursive' :
                'font-sans'
              }`}>
                {/* Images top */}
                {pageConfig.contentImages?.filter(img => img.position === 'top').map((img, idx) => (
                  <figure key={`top-${idx}`} className="w-full my-6">
                    <img 
                      src={img.url} 
                      alt={img.caption || `Image ${idx + 1}`}
                      className={`w-full ${theme === 'retro-90' || theme === 'windows-98' ? 'border-4 border-black' : theme === 'altavista-98' ? 'border-2 border-black' : layoutStyles.imageStyle}`}
                    />
                    {img.caption && (
                      <figcaption className={`text-sm mt-2 text-center italic ${config.date}`}>
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
                
                {/* Contenu textuel */}
                {result.pageContent ? (
                  <div className="whitespace-pre-wrap">
                    {result.pageContent}
                  </div>
                ) : (
                  <div className="opacity-50 italic">
                    {theme === 'hacker-terminal' ? '// NO DATA AVAILABLE' : '(Contenu non disponible)'}
                    <br/><br/>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    <br/><br/>
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                  </div>
                )}
                
                {/* Images inline/side */}
                {pageConfig.contentImages?.filter(img => img.position === 'inline' || img.position === 'side' || !img.position).map((img, idx) => {
                  const widthClass = 
                    img.width === 'small' ? 'w-64' :
                    img.width === 'medium' ? 'w-96' :
                    img.width === 'large' ? 'w-full max-w-4xl' :
                    img.width === 'full' ? 'w-full' :
                    'w-96';
                  
                  const positionClass =
                    img.position === 'side' ? 'float-right ml-6 mb-4' :
                    'block mx-auto';
                  
                  return (
                    <figure key={`inline-${idx}`} className={`${positionClass} ${widthClass} my-6`}>
                      <img 
                        src={img.url} 
                        alt={img.caption || `Image ${idx + 1}`}
                        className={`w-full ${theme === 'retro-90' || theme === 'windows-98' ? 'border-4 border-black' : theme === 'altavista-98' ? 'border-2 border-black' : layoutStyles.imageStyle}`}
                      />
                      {img.caption && (
                        <figcaption className={`text-sm mt-2 italic ${config.date}`}>
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
                
                {/* Images bottom */}
                {pageConfig.contentImages?.filter(img => img.position === 'bottom').map((img, idx) => (
                  <figure key={`bottom-${idx}`} className="w-full my-6">
                    <img 
                      src={img.url} 
                      alt={img.caption || `Image ${idx + 1}`}
                      className={`w-full ${theme === 'retro-90' || theme === 'windows-98' ? 'border-4 border-black' : theme === 'altavista-98' ? 'border-2 border-black' : layoutStyles.imageStyle}`}
                    />
                    {img.caption && (
                      <figcaption className={`text-sm mt-2 text-center italic ${config.date}`}>
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>

              {/* Footer rétro */}
              {(theme === 'retro-90' || theme === 'windows-98') && (
                <div className="mt-12 border-t-2 border-black pt-4 flex justify-center gap-4">
                  <div className="w-32 h-10 bg-black text-white flex items-center justify-center text-xs animate-pulse font-bold">CLICK HERE!</div>
                  <div className="w-32 h-10 bg-yellow-300 text-red-600 flex items-center justify-center text-xs font-black border-2 border-red-600">YOU WIN!</div>
                </div>
              )}

              {theme === 'hacker-terminal' && (
                <div className="mt-8 text-green-600 text-xs border-t border-green-500 pt-4">
                  {'>'} EOF | Press ESC to return
                </div>
              )}
            </div>
          </main>
          
          {/* Sidebar */}
          {renderSidebar()}
        </div>
      </div>
    </div>
  );
};