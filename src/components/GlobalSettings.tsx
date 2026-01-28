import { useState } from 'react';
import { Settings, Key, X, CheckCircle, Info, Palette } from 'lucide-react';
import { useProjectStore } from '../core/store/projectStore';
import { applyTheme, themes, type ThemeId } from '../core/engine/themeEngine';

interface GlobalSettingsProps {
  onClose: () => void;
}

export const GlobalSettings = ({ onClose }: GlobalSettingsProps) => {
  const currentScene = useProjectStore((state) => state.getCurrentScene());
  const updateCurrentScene = useProjectStore((state) => state.updateCurrentScene);
  const [apiKey, setApiKey] = useState(currentScene?.globalSettings?.aiKey || '');
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'theme'>('api');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(
    (localStorage.getItem('cinesuite-theme') as ThemeId) || 'modern'
  );

  const handleThemeChange = (themeId: ThemeId) => {
    applyTheme(themeId);
    setCurrentTheme(themeId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSave = () => {
    updateCurrentScene({
      globalSettings: {
        themeId: currentScene?.globalSettings?.themeId || 'light',
        zoomLevel: currentScene?.globalSettings?.zoomLevel || 100,
        accentColor: currentScene?.globalSettings?.accentColor,
        aiKey: apiKey
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        
        {/* Header */}
        <div className="bg-linear-to-r from-gray-700 to-gray-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Paramètres</h2>
              <p className="text-gray-300 text-sm">Configuration générale de l'application</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'api'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Key size={16} />
            API Key
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'theme'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Palette size={16} />
            Thèmes
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">{activeTab === 'api' ? (
          <>
          
          {/* API Key Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key size={20} className="text-gray-600" />
              <h3 className="text-lg font-bold text-gray-800">Clé API Groq</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-1">Pourquoi une clé API ?</p>
                  <p className="mb-2">L'Intelligence Artificielle a besoin d'une clé pour générer du contenu réaliste pour vos scènes.</p>
                  <p className="font-bold mb-1">Comment l'obtenir ?</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Rendez-vous sur <a href="https://console.groq.com" target="_blank" className="underline font-bold">console.groq.com</a></li>
                    <li>Créez un compte gratuit (c'est rapide !)</li>
                    <li>Allez dans "API Keys" et créez une nouvelle clé</li>
                    <li>Copiez-la et collez-la ci-dessous</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxx"
                className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg focus:border-indigo-500 outline-none font-mono text-sm"
              />
              {apiKey && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              🔒 Votre clé est stockée localement sur votre ordinateur, jamais envoyée ailleurs que vers l'API Groq
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle size={20} />
                  Sauvegardé !
                </>
              ) : (
                <>
                  <Settings size={20} />
                  Sauvegarder
                </>
              )}
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">💡 Besoin d'aide ?</h4>
            <p className="text-sm text-gray-600 mb-2">
              Si vous rencontrez des difficultés pour obtenir votre clé API :
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• L'inscription sur Groq est <strong>100% gratuite</strong></li>
              <li>• Aucune carte bancaire n'est demandée</li>
              <li>• La clé commence toujours par "gsk_"</li>
              <li>• Vous pouvez créer plusieurs clés si nécessaire</li>
            </ul>
          </div>
          </>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Palette size={20} className="text-gray-600" />
                Choisissez un thème
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Le thème s'applique globalement à toute l'application
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.values(themes).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    currentTheme === theme.id
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <CheckCircle size={16} className="text-indigo-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-2 capitalize">
                    {theme.category}
                  </div>
                  <div className="flex gap-1.5">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.cssVariables['--bg-primary'] }}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.cssVariables['--accent'] }}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.cssVariables['--text-primary'] }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {isSaved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-sm text-green-800">Thème appliqué avec succès !</span>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Footer avec boutons uniquement pour l'onglet API */}
        {activeTab === 'api' && (
          <div className="p-8 pt-0">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Fermer
              </button>
              <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isSaved ? (
                  <>
                    <CheckCircle size={20} />
                    Sauvegardé !
                  </>
                ) : (
                  <>
                    <Settings size={20} />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
