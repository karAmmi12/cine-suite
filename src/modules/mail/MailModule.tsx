import { useState } from 'react';
import { useProjectStore } from '../../core/store/projectStore';
import type { MailModuleConfig } from '../../core/types/schema';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';
import { Menu, Star, Inbox, Send, Trash, Edit3, ArrowLeft, Paperclip, StarIcon, AlertCircle } from 'lucide-react';

export const MailModule = () => {
  const scene = useProjectStore((state) => state.getCurrentScene());
  const config = scene?.module as MailModuleConfig;

  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const { displayValue, isComplete } = useMagicTyping(config?.triggerText || "", isComposing);

  if (!config) return null;

  const currentMail = config.emails.find(e => e.id === selectedMailId);

  return (
    <div className="flex h-dvh bg-gray-100 font-sans text-gray-800 overflow-hidden">
      
      {/* === SIDEBAR (Gauche) === */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-4 flex items-center gap-2 border-b border-gray-200">
           <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
             {config.userEmail.charAt(0).toUpperCase()}
           </div>
           <div className="text-sm overflow-hidden text-ellipsis font-medium">{config.userEmail}</div>
        </div>
        
        <div className="p-4 space-y-1">
          <button 
            onClick={() => setIsComposing(true)}
            className="w-full flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-3 rounded-xl mb-6 hover:shadow-md transition-all text-gray-700 font-medium"
          >
            <Edit3 size={18} /> Nouveau message
          </button>

          <NavItem icon={<Inbox size={18}/>} label="Boîte de réception" active count={config.emails.filter(e => !e.read).length} />
          <NavItem icon={<Star size={18}/>} label="Favoris" />
          <NavItem icon={<Send size={18}/>} label="Envoyés" />
          <NavItem icon={<Trash size={18}/>} label="Corbeille" />
        </div>
      </div>

      {/* === LISTE DES MAILS (Milieu) === */}
      {/* Sur mobile, on cache cette colonne si un mail est ouvert */}
      <div className={`flex-1 flex flex-col bg-white min-w-0 ${selectedMailId || isComposing ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header simple */}
        <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between">
            <div className="flex items-center gap-3 md:hidden">
                 <Menu className="text-gray-500" />
                 <span className="font-bold text-lg">Boîte de réception</span>
            </div>
            {/* Recherche fake */}
            <div className="hidden md:block w-full max-w-md bg-gray-100 rounded-lg h-9 mx-auto" />
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {config.emails.map(mail => (
            <div 
              key={mail.id}
              onClick={() => setSelectedMailId(mail.id)}
              className={`border-b border-gray-100 p-4 cursor-pointer hover:shadow-inner transition-all ${!mail.read ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox + Star */}
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <button className="text-gray-400 hover:text-yellow-500">
                    {mail.starred ? <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <Star className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Important badge */}
                {mail.important && (
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1" />
                )}
                
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`text-sm truncate ${!mail.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {mail.senderName}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{mail.date}</span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm ${!mail.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {mail.subject}
                    </span>
                    {mail.labels && mail.labels.length > 0 && (
                      <div className="flex gap-1">
                        {mail.labels.map((label, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                    {mail.preview}
                    {mail.attachments && mail.attachments.length > 0 && (
                      <Paperclip className="inline w-3 h-3 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
            onClick={() => setIsComposing(true)}
            className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        >
            <Edit3 />
        </button>
      </div>

      {(selectedMailId || isComposing) && (
        <div className="absolute inset-0 md:static md:flex-[1.5] bg-white border-l border-gray-200 flex flex-col z-20">
            
            <div className="h-14 border-b border-gray-200 flex items-center px-4 gap-4">
                <button onClick={() => { setSelectedMailId(null); setIsComposing(false); }} className="md:hidden p-2 -ml-2">
                    <ArrowLeft />
                </button>
                <div className="flex gap-4 text-gray-500">
                    <Trash className="hover:text-red-500 cursor-pointer" />
                    <Star className="hover:text-yellow-500 cursor-pointer" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {isComposing ? (
                    <div className="space-y-6">
                        <div className="border-b pb-2 text-gray-500">À: <span className="text-gray-900">destinataire@exemple.com</span></div>
                        <div className="border-b pb-2 text-gray-500">Objet: <span className="text-gray-900 font-medium">Démission</span></div>
                        <div className="mt-4 text-lg text-gray-800 whitespace-pre-wrap font-serif">
                            {displayValue}
                            {!isComplete && <span className="animate-pulse">|</span>}
                        </div>
                    </div>
                ) : currentMail ? (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">{currentMail.subject}</h1>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                                {currentMail.senderName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-sm">{currentMail.senderName}</div>
                                <div className="text-xs text-gray-500">&lt;{currentMail.senderEmail}&gt;</div>
                            </div>
                            <div className="ml-auto text-xs text-gray-400">{currentMail.date}</div>
                        </div>
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif text-lg">
                            {currentMail.body}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
      )}

    </div>
  );
};

// Petit composant helper pour le menu
const NavItem = ({ icon, label, active, count }: any) => (
  <div className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
    <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
    </div>
    {count > 0 && <span className="text-xs font-bold">{count}</span>}
  </div>
);