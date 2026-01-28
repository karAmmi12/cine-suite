import { useRef, useState } from 'react';
import { Plus, Trash, Play, Download, Upload, Mail, CheckSquare, Square, Sparkles, Loader2, Key } from 'lucide-react';
import { useSceneStore } from '../../../core/store/sceneStore';
import type { MailModuleConfig, MailMessage } from '../../../core/types/schema';
import { downloadSceneConfig, readJsonFile } from '../../../core/utils/fileHandler';
import { ImagePicker } from '../../../ui/atoms/ImagePicker';
import { generateMailConfig } from '../../../core/services/configGeneratorService';

export const MailEditor = () => {
  const { currentScene, updateScene, loadScene } = useSceneStore();
  
  // Settings & IA
  const globalSettings = currentScene?.globalSettings;
  const updateGlobalSettings = (settings: any) => updateScene({ globalSettings: settings });
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentScene || currentScene.module.type !== 'mail') return <div className="p-8 text-red-500">Erreur: Pas de scène Mail</div>;

  const config = currentScene.module as MailModuleConfig;

  // --- LOGIQUE IA PROFESSIONNELLE ---
  const handleAiGeneration = async () => {
    if (!globalSettings?.aiKey) {
      alert("⚠️ Clé API Groq manquante ! Ajoutez-la en haut à droite.");
      return;
    }
    
    const context = prompt("📧 Contexte des emails ? (ex: Employé stressé recevant trop d'emails, Harcèlement au travail, Spam professionnel...)");
    if (!context) return;

    setIsGenerating(true);
    try {
      // Utilisation du SERVICE IA PROFESSIONNEL
      const generatedConfig = await generateMailConfig(context, { apiKey: globalSettings.aiKey });
      
      // On applique TOUTE la configuration générée
      updateConfig('emails', generatedConfig.emails); 
      
      alert(`✅ ${generatedConfig.emails.length} emails générés par l'IA professionnelle !`);
    } catch (e: any) {
      alert("❌ Erreur IA : " + (e.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LOGIQUE UPDATE ---
  const updateConfig = (key: keyof MailModuleConfig, value: any) => {
    updateScene({ module: { ...config, [key]: value } });
  };

  const updateMail = (id: string, field: keyof MailMessage, value: any) => {
    const newEmails = config.emails.map(e => e.id === id ? { ...e, [field]: value } : e);
    updateConfig('emails', newEmails);
  };

  const addMail = () => {
    const newMail: MailMessage = {
      id: Date.now().toString(),
      folder: 'inbox',
      read: false,
      senderName: "Nouveau Contact",
      senderEmail: "contact@exemple.com",
      subject: "Sujet du mail",
      preview: "Aperçu...",
      body: "Contenu...",
      date: "10:00"
    };
    updateConfig('emails', [newMail, ...config.emails]);
  };

  const removeMail = (id: string) => {
    updateConfig('emails', config.emails.filter(e => e.id !== id));
  };

  // --- IMPORT / EXPORT ---
  const handleExport = () => downloadSceneConfig(currentScene);
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const newScene = await readJsonFile(file);
        loadScene(newScene);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto pb-32">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">CineSuite Studio</h1>
            <p className="text-xs text-red-600 uppercase tracking-wider font-bold">Éditeur E-mail</p>
          </div>
          <div className="flex gap-2 items-center">
             {/* Input Clé API */}
             <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 border border-gray-200 mr-2 h-9">
                <Key size={14} className="text-gray-400"/>
                <input 
                    type="password" 
                    placeholder="Clé API Groq..."
                    value={globalSettings?.aiKey || ''}
                    onChange={(e) => updateGlobalSettings({ ...globalSettings, aiKey: e.target.value })}
                    className="bg-transparent border-none outline-none text-xs w-24 focus:w-48 transition-all"
                />
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button onClick={handleImportClick} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Upload size={18}/></button>
            <button onClick={handleExport} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Download size={18}/></button>
            <div className="w-px h-8 bg-gray-300 mx-2"></div>
            <button 
                onClick={() => window.open('/', 'CinePlayer', 'popup=yes,width=1280,height=720')}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md shadow-red-200 font-bold text-sm"
            >
              <Play size={16} /> LANCER
            </button>
          </div>
        </div>

        {/* CONFIG IDENTITÉ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-auto flex justify-center">
                <ImagePicker 
                    label="Avatar Héros"
                    value={config.userAvatar}
                    onChange={(val) => updateConfig('userAvatar', val)}
                />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email du Personnage</label>
                    <input 
                        value={config.userEmail}
                        onChange={(e) => updateConfig('userEmail', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 font-medium outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message à écrire (Magic Typing)</label>
                    <textarea 
                        value={config.triggerText}
                        onChange={(e) => updateConfig('triggerText', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-red-50 text-red-900 font-mono text-sm outline-none h-20 resize-none"
                    />
                </div>
            </div>
        </div>

        {/* LISTE DES EMAILS */}
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={16} /> Boîte de réception
                </h2>
                <div className="flex gap-2">
                     {/* BOUTON IA */}
                     <button 
                        onClick={handleAiGeneration} 
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 text-sm font-bold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-purple-200 disabled:opacity-70"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />} 
                        {isGenerating ? '...' : 'Générer IA'}
                    </button>

                    <button onClick={addMail} className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors">
                        <Plus size={16}/> Manuel
                    </button>
                </div>
            </div>

            {config.emails.map((mail) => (
                <div key={mail.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-red-300 transition-all group">
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                        <div className="flex gap-4 items-center">
                            <button 
                                onClick={() => updateMail(mail.id, 'read', !mail.read)}
                                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ${mail.read ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}
                            >
                                {mail.read ? <CheckSquare size={14}/> : <Square size={14}/>}
                                {mail.read ? 'LU' : 'NON LU'}
                            </button>
                            <input 
                                value={mail.date}
                                onChange={(e) => updateMail(mail.id, 'date', e.target.value)}
                                className="w-20 text-xs text-gray-400 text-right outline-none"
                            />
                        </div>
                        <button onClick={() => removeMail(mail.id)} className="text-gray-300 hover:text-red-500">
                            <Trash size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <input 
                            value={mail.senderName} 
                            onChange={(e) => updateMail(mail.id, 'senderName', e.target.value)}
                            className="font-bold text-gray-800 outline-none border-b border-transparent hover:border-gray-200"
                            placeholder="Nom"
                        />
                        <input 
                            value={mail.senderEmail} 
                            onChange={(e) => updateMail(mail.id, 'senderEmail', e.target.value)}
                            className="text-sm text-gray-500 outline-none border-b border-transparent hover:border-gray-200"
                            placeholder="Email"
                        />
                    </div>
                    
                    <input 
                        value={mail.subject} 
                        onChange={(e) => updateMail(mail.id, 'subject', e.target.value)}
                        className="w-full font-medium text-lg mb-2 outline-none border-b border-transparent hover:border-gray-200"
                        placeholder="Objet"
                    />

                    <textarea 
                        value={mail.body} 
                        onChange={(e) => updateMail(mail.id, 'body', e.target.value)}
                        className="w-full text-sm text-gray-600 bg-gray-50 p-3 rounded-lg outline-none resize-y min-h-25"
                        placeholder="Corps..."
                    />
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};