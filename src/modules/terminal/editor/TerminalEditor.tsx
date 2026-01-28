import { useRef, useState } from 'react';
import { Play, Download, Upload, Terminal as TerminalIcon, Sparkles, Loader2, Key } from 'lucide-react';
import { useProjectStore } from '../../../core/store/projectStore';
import type { TerminalModuleConfig } from '../../../core/types/schema';
import { downloadSceneConfig } from '../../../core/utils/fileHandler';

export const TerminalEditor = () => {
  const currentScene = useProjectStore((state) => state.getCurrentScene());
  const updateCurrentScene = useProjectStore((state) => state.updateCurrentScene);
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const currentSceneId = useProjectStore((state) => state.currentSceneId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings globaux
  const globalSettings = currentScene?.globalSettings;
  const updateGlobalSettings = (settings: any) => updateCurrentScene({ globalSettings: settings });

  if (!currentScene || currentScene.module.type !== 'terminal') return <div>Erreur</div>;
  const config = currentScene.module as TerminalModuleConfig;

  const updateConfig = (key: keyof TerminalModuleConfig, value: any) => {
    updateCurrentScene({ module: { ...config, [key]: value } });
  };

  // --- IA PROFESSIONNELLE: Génération contextuelle ---
  const generateWithAI = async () => {
    if (!globalSettings?.aiKey) {
      alert("⚠️ Clé API Groq manquante ! Ajoutez-la en haut à droite.");
      return;
    }

    const contexts = [
      "Hacking d'un système gouvernemental",
      "Compilation d'un projet logiciel",
      "Analyse d'un serveur compromis",
      "Déchiffrement de fichiers cryptés",
      "Déploiement d'une application",
      "Scan réseau et détection d'intrusion",
      "Exfiltration de données sensibles"
    ];
    
    const context = prompt(`💻 Choisissez un contexte ou entrez le vôtre:\n\n${contexts.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nVotre choix (numéro ou texte) :`);
    if (!context) return;

    // Si c'est un nombre, on prend le contexte correspondant
    const selectedContext = !isNaN(Number(context)) && Number(context) > 0 && Number(context) <= contexts.length
      ? contexts[Number(context) - 1]
      : context;

    setIsGenerating(true);
    try {
      // Utilisation du SERVICE IA PROFESSIONNEL
      const prompt = `Tu es un expert en terminal Linux/Unix. Génère une séquence Terminal réaliste pour: "${selectedContext}". 

IMPORTANT:
- "triggerText" doit être une VRAIE commande shell (ex: "sudo ./exploit.sh", "npm run deploy", "python3 decrypt.py", "nmap -sV 192.168.1.1")
- "lines" contient les lignes d'output du terminal (résultats de la commande)
- Utilise des commandes shell réelles et crédibles (bash, python, nmap, ssh, git, docker, etc.)

Réponds UNIQUEMENT avec un JSON valide (sans markdown):
{
  "triggerText": "commande_shell_reelle",
  "lines": ["[INFO] Starting process...", "Loading modules...", "Processing data...", "Success!"],
  "color": "green",
  "finalMessage": "OPERATION COMPLETE",
  "finalStatus": "success"
}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalSettings.aiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          max_tokens: 2000
        })
      });

      if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      // Parse le JSON généré
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Format de réponse invalide");
      
      const generated = JSON.parse(jsonMatch[0]);
      
      // On applique TOUTE la configuration générée
      updateCurrentScene({ 
        module: { 
          ...config,
          triggerText: generated.triggerText,
          lines: generated.lines,
          color: generated.color,
          finalMessage: generated.finalMessage,
          finalStatus: generated.finalStatus
        } 
      });
      
      alert(`✅ Séquence Terminal générée par l'IA professionnelle !\nContexte: ${selectedContext}`);
    } catch (e: any) {
      alert("❌ Erreur IA : " + (e.message || e));
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- IA GENERATION DE LOGS SIMPLE (Fallback) ---
  const generateLogs = () => {
    // Petit helper pour remplir les lignes de code avec du faux charabia technique
    const techWords = ["bypass", "mainframe", "encryption", "firewall", "proxy", "node", "root", "access", "token", "hash", "inject", "override"];
    const newLines = Array.from({ length: 20 }).map(() => {
        const cmd = techWords[Math.floor(Math.random() * techWords.length)].toUpperCase();
        const file = `SYS_${Math.floor(Math.random() * 9999)}.DAT`;
        return `EXECUTING ${cmd} PROTOCOL ON ${file} ... [OK]`;
    });
    updateConfig('lines', newLines);
  };

  // Import/Export
  const handleExport = () => downloadSceneConfig(currentScene);
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implémenter loadScene dans projectStore
      alert("Import de scène temporairement désactivé (refactoring en cours)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono pb-32">
        <div className="max-w-4xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4 sticky top-4 bg-gray-900 z-20">
                <div>
                  <h1 className="text-xl font-bold text-green-500 flex items-center gap-2">
                      <TerminalIcon /> TERMINAL EDITOR
                  </h1>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Éditeur de Terminal Cinématique</p>
                </div>
                <div className="flex gap-2 items-center">
                    {/* Clé API */}
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-2 border border-gray-700 h-9 mr-2">
                        <Key size={14} className="text-gray-400"/>
                        <input 
                            type="password" 
                            placeholder="Clé API Groq..."
                            value={globalSettings?.aiKey || ''}
                            onChange={(e) => updateGlobalSettings({ ...globalSettings, aiKey: e.target.value })}
                            className="bg-transparent border-none outline-none text-xs w-24 focus:w-40 transition-all text-white"
                        />
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    <button onClick={handleImportClick} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><Upload size={18}/></button>
                    <button onClick={handleExport} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><Download size={18}/></button>
                    
                    <div className="w-px h-8 bg-gray-700"></div>

                    <button 
                        onClick={() => window.open(`/project/${currentProjectId}/scene/${currentSceneId}/play`, 'CinePlayer', 'popup=yes,width=1280,height=720')}
                        className="bg-green-600 text-black px-4 py-2 rounded font-bold hover:bg-green-500 flex items-center gap-2"
                    >
                        <Play size={16}/> RUN
                    </button>
                </div>
            </div>

            {/* BOUTON IA GÉNÉRATION */}
            <div className="mb-6">
                <button
                    onClick={generateWithAI}
                    disabled={isGenerating}
                    className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/50 transition-all"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Génération en cours avec l'IA...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            <span>✨ GÉNÉRER AVEC L'IA PROFESSIONNELLE</span>
                        </>
                    )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    L'IA génère des séquences Terminal réalistes selon le contexte (hacking, compilation, analyse...)
                </p>
            </div>

            {/* CONFIGURATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">COULEUR</label>
                        <div className="flex gap-2">
                            {['green', 'blue', 'red', 'amber'].map(c => (
                                <button 
                                    key={c}
                                    onClick={() => updateConfig('color', c)}
                                    className={`w-8 h-8 rounded-full border-2 ${config.color === c ? 'border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: c === 'amber' ? 'orange' : c === 'green' ? 'lime' : c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">COMMANDE DE DÉPART (MAGIC TYPING)</label>
                        <input 
                            value={config.triggerText}
                            onChange={(e) => updateConfig('triggerText', e.target.value)}
                            className="w-full bg-black border border-gray-700 p-2 text-green-500 font-mono"
                            placeholder="ex: sudo hack_nsa.exe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">VITESSE DE DÉFILEMENT</label>
                        <select 
                            value={config.typingSpeed} 
                            onChange={(e) => updateConfig('typingSpeed', e.target.value)}
                            className="w-full bg-black border border-gray-700 p-2"
                        >
                            <option value="slow">Lente (Réalisme)</option>
                            <option value="fast">Rapide (Hacking)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">MESSAGE FINAL</label>
                        <input 
                            value={config.finalMessage}
                            onChange={(e) => updateConfig('finalMessage', e.target.value)}
                            className="w-full bg-black border border-gray-700 p-2 font-bold"
                        />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => updateConfig('finalStatus', 'success')} className={`flex-1 p-2 border ${config.finalStatus === 'success' ? 'bg-green-900 border-green-500' : 'border-gray-700'}`}>SUCCESS</button>
                            <button onClick={() => updateConfig('finalStatus', 'error')} className={`flex-1 p-2 border ${config.finalStatus === 'error' ? 'bg-red-900 border-red-500' : 'border-gray-700'}`}>ERROR</button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">DURÉE BARRE PROGRESSION (SEC)</label>
                        <input 
                            type="number"
                            value={config.progressDuration}
                            onChange={(e) => updateConfig('progressDuration', parseInt(e.target.value))}
                            className="w-full bg-black border border-gray-700 p-2"
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" 
                                checked={config.showProgressBar} 
                                onChange={(e) => updateConfig('showProgressBar', e.target.checked)}
                            />
                            <span className="text-sm">Afficher la barre</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    <div className="flex justify-between mb-1">
                        <label className="text-xs text-gray-400">LIGNES DE CODE (LOGS)</label>
                        <button onClick={generateLogs} className="text-xs text-green-500 hover:underline flex items-center gap-1">
                          <Sparkles size={12} /> Générer Faux Code
                        </button>
                    </div>
                    <textarea 
                        value={(config.lines || []).join('\n')}
                        onChange={(e) => updateConfig('lines', e.target.value.split('\n'))}
                        className="flex-1 w-full bg-black border border-gray-700 p-2 text-xs font-mono text-gray-500 whitespace-pre"
                    />
                </div>

            </div>
        </div>
    </div>
  );
};