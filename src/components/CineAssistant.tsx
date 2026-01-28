import { useState } from 'react';
import { Sparkles, Film, MessageSquare, Search, Mail, Terminal, X, Wand2, CheckCircle } from 'lucide-react';
import { useProjectStore } from '../core/store/projectStore';
import { generateSearchConfig } from '../core/services/configGeneratorService';
import { generateChatConfig } from '../core/services/configGeneratorService';
import { generateMailConfig } from '../core/services/configGeneratorService';
import { extractDateContext } from '../core/utils/dateHelper';

interface CineAssistantProps {
  onClose: () => void;
}

type SceneType = 'search' | 'chat' | 'mail' | 'terminal';

export const CineAssistant = ({ onClose }: CineAssistantProps) => {
  const [step, setStep] = useState<'type' | 'description' | 'generating' | 'done'>('type');
  const [selectedType, setSelectedType] = useState<SceneType | null>(null);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const updateCurrentScene = useProjectStore((state) => state.updateCurrentScene);
  const currentScene = useProjectStore((state) => state.getCurrentScene());

  const sceneTypes = [
    {
      type: 'search' as SceneType,
      icon: Search,
      title: 'Recherche Internet',
      subtitle: 'Moteur de recherche, enquête, investigation',
      examples: ['Recherche compromettante', 'Enquête policière', 'Découverte choquante'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'chat' as SceneType,
      icon: MessageSquare,
      title: 'Conversation SMS/Chat',
      subtitle: 'Messages, discussion, révélation',
      examples: ['Dispute de couple', 'Menace anonyme', 'Confession'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'mail' as SceneType,
      icon: Mail,
      title: 'Boîte Email',
      subtitle: 'Messages professionnels, spam, pression',
      examples: ['Harcèlement au travail', 'Ultimatum', 'Révélation'],
      color: 'from-red-500 to-orange-500'
    },
    {
      type: 'terminal' as SceneType,
      icon: Terminal,
      title: 'Terminal Hacking',
      subtitle: 'Piratage, code, infiltration système',
      examples: ['Hacking FBI', 'Brute force', 'Accès serveur'],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleGenerate = async () => {
    if (!selectedType || !description) return;

    const apiKey = currentScene?.globalSettings?.aiKey;
    if (!apiKey) {
      alert("⚙️ Veuillez d'abord configurer votre clé API dans les Paramètres (icône ⚙️ en haut)");
      return;
    }

    setStep('generating');
    setIsGenerating(true);

    try {
      let generatedModule;

      switch (selectedType) {
        case 'search':
          generatedModule = await generateSearchConfig(description, { apiKey });
          break;
        case 'chat':
          generatedModule = await generateChatConfig(description, { apiKey });
          break;
        case 'mail':
          generatedModule = await generateMailConfig(description, { apiKey });
          break;
        case 'terminal':
          // Génération Terminal via API directe
          const dateContext = extractDateContext(description);
          
          const prompt = `Tu es un expert en création de scènes Terminal pour le cinéma.

Contexte demandé: "${description}"

IMPORTANT - Contexte temporel: ${dateContext.instruction}
Si des dates/timestamps apparaissent dans les logs, adapte-les à cette période.
Si c'est une époque ancienne (années 90-2000), adapte les commandes et technologies (anciens OS, vieux protocoles).

Génère une séquence de terminal réaliste et cinématographique. Réponds avec un JSON valide contenant:
- triggerText: la commande shell de départ (exemple: "ssh root@server.com")
- lines: tableau de lignes qui apparaissent (10-20 lignes, réalistes avec timestamps, préfixes, etc.)
- color: "green" (normal), "blue" (ssh/réseau), "red" (alerte/hack), ou "amber" (build/compilation)
- finalMessage: message final court et percutant (3-5 mots max)
- finalStatus: "success" ou "error"

Exemple:
{
  "triggerText": "ssh admin@target.gov",
  "lines": ["Connecting...", "Password accepted", "$ ls /classified"],
  "color": "red",
  "finalMessage": "ACCESS GRANTED",
  "finalStatus": "success"
}

Réponds UNIQUEMENT avec le JSON, sans explication.`;

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
              max_tokens: 2000
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Erreur API: ${response.status}`);
          }

          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          
          if (!content) {
            throw new Error("L'IA n'a pas répondu. Vérifiez votre clé API.");
          }

          // Extraction JSON plus permissive
          let jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            // Tentative de nettoyage si markdown ou texte autour
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          }
          
          if (!jsonMatch) {
            throw new Error("❌ L'IA n'a pas retourné de JSON valide. Essayez de reformuler votre description.");
          }
          
          let parsedData;
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (e) {
            throw new Error("❌ JSON mal formé. Réessayez avec une description plus simple.");
          }

          // Validation des champs obligatoires avec valeurs par défaut
          if (!parsedData.triggerText || !Array.isArray(parsedData.lines)) {
            throw new Error("❌ Données incomplètes. Reformulez votre demande plus clairement.");
          }

          generatedModule = {
            type: 'terminal' as const,
            triggerText: parsedData.triggerText,
            lines: parsedData.lines,
            color: parsedData.color || 'green',
            finalMessage: parsedData.finalMessage || 'OPÉRATION TERMINÉE',
            finalStatus: parsedData.finalStatus || 'success',
            showProgressBar: true,
            progressDuration: 5,
            typingSpeed: 'fast' as const
          };
          break;
      }

      // Applique le module généré
      updateCurrentScene({ 
        module: generatedModule
      });

      setStep('done');
    } catch (error: any) {
      console.error('Erreur génération IA:', error);
      
      // Messages d'erreur plus explicites
      let errorMessage = error.message;
      
      if (errorMessage.includes('401') || errorMessage.includes('Invalid API Key')) {
        errorMessage = "🔑 Clé API invalide ou expirée. Vérifiez vos paramètres.";
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        errorMessage = "⏱️ Trop de requêtes. Attendez quelques secondes et réessayez.";
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        errorMessage = "🔧 Serveur IA temporairement indisponible. Réessayez dans 1 minute.";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = "🌐 Problème de connexion internet. Vérifiez votre réseau.";
      } else if (!errorMessage.includes('❌')) {
        // Ajouter emoji si pas déjà présent
        errorMessage = `❌ ${errorMessage}`;
      }
      
      alert(errorMessage);
      setStep('description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl">
              <Wand2 size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black">Assistant Cinéma IA</h2>
              <p className="text-purple-100 text-sm">Créez votre scène en 30 secondes</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          
          {/* ÉTAPE 1: Choix du type de scène */}
          {step === 'type' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Quel type de scène voulez-vous créer ?</h3>
              <p className="text-gray-500 mb-8">Choisissez le type d'écran que vous souhaitez filmer</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sceneTypes.map((scene) => {
                  const Icon = scene.icon;
                  const isSelected = selectedType === scene.type;
                  
                  return (
                    <button
                      key={scene.type}
                      onClick={() => setSelectedType(scene.type)}
                      className={`p-6 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                        isSelected 
                          ? 'border-purple-600 bg-purple-50 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className={`inline-block p-3 rounded-xl bg-linear-to-r ${scene.color} text-white mb-4`}>
                        <Icon size={28} />
                      </div>
                      
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{scene.title}</h4>
                      <p className="text-sm text-gray-500 mb-3">{scene.subtitle}</p>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Exemples:</p>
                        {scene.examples.map((ex, i) => (
                          <p key={i} className="text-xs text-gray-600">• {ex}</p>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => selectedType && setStep('description')}
                  disabled={!selectedType}
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Suivant <Sparkles size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2: Description de la scène */}
          {step === 'description' && selectedType && (
            <div>
              <button 
                onClick={() => setStep('type')}
                className="text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Retour
              </button>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Décrivez votre scène</h3>
              <p className="text-gray-500 mb-6">
                Expliquez en quelques mots le contexte et l'ambiance de la scène. 
                L'IA générera tout le contenu automatiquement.
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description narrative (comme si vous briefiez un technicien plateau)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Exemple: Un détective recherche des informations sur un suspect et découvre des preuves accablantes. L'atmosphère est sombre et tendue."
                  className="w-full h-32 p-4 rounded-lg border-2 border-purple-200 focus:border-purple-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Plus vous êtes précis, meilleur sera le résultat
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-bold text-blue-900 mb-2">📝 Exemples de descriptions:</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• "Un hacker infiltre le serveur du FBI pour récupérer des documents classifiés"</li>
                  <li>• "Une femme reçoit des messages menaçants de son ex-conjoint violent"</li>
                  <li>• "Un employé découvre des emails prouvant que son patron détourne de l'argent"</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  📅 Astuce: Précisez la période !
                </h4>
                <p className="text-sm text-amber-800 mb-2">
                  L'IA adaptera automatiquement les dates et le style à l'époque demandée:
                </p>
                <ul className="space-y-1.5 text-xs text-amber-700">
                  <li>• <strong>"en 2024"</strong> → dates récentes, technologies actuelles</li>
                  <li>• <strong>"dans les années 90"</strong> → style rétro, anciens OS, vieux protocoles</li>
                  <li>• <strong>"le 15 janvier 2023"</strong> → dates proches de cette date précise</li>
                  <li>• <strong>"début 2020"</strong> → contexte début d'année 2020</li>
                  <li>• <strong>"il y a 2 ans"</strong> → dates relatives</li>
                </ul>
                <p className="text-xs text-amber-600 mt-2 italic">
                  Exemple: "Un hacker en 1998 infiltre un serveur via Telnet"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('type')}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Retour
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!description.trim() || isGenerating}
                  className="flex-1 px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Générer la scène avec l'IA
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Génération en cours */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-purple-100 rounded-full mb-6 animate-pulse">
                <Wand2 size={48} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">L'IA crée votre scène...</h3>
              <p className="text-gray-500 mb-8">
                Génération du contenu, des dialogues et des paramètres optimaux
              </p>
              <div className="max-w-md mx-auto space-y-3">
                {[
                  'Analyse du contexte narratif',
                  'Génération du contenu réaliste', 
                  'Optimisation pour le tournage',
                  'Finalisation...'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="text-gray-600">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 4: Terminé */}
          {step === 'done' && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Scène créée avec succès ! 🎬</h3>
              <p className="text-gray-500 mb-8">
                Votre scène est prête à être filmée. Vous pouvez maintenant la prévisualiser ou l'ajuster.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Film size={20} />
                  Voir ma scène
                </button>
                <button
                  onClick={() => {
                    setStep('type');
                    setSelectedType(null);
                    setDescription('');
                  }}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Créer une autre scène
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
