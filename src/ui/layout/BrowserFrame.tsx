import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Star, MoreVertical } from 'lucide-react';

interface BrowserFrameProps {
  children: ReactNode;
  url: string; // L'URL qu'on veut afficher
  theme?: 'light' | 'dark';
}

export const BrowserFrame = ({ children, url, theme = 'light' }: BrowserFrameProps) => {
  const isDark = theme === 'dark';
  const bgBase = isDark ? 'bg-[#202124]' : 'bg-[#f3f3f3]'; // Couleurs Chrome
  const textBase = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#35363a]' : 'bg-white';
  const inputText = isDark ? 'text-white' : 'text-gray-800';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
      
      {/* === LA FAUSSE BARRE D'ADRESSE === */}
      <div className={`h-10 flex items-center px-2 gap-2 border-b ${bgBase} ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        
        {/* Boutons Navigation */}
        <div className={`flex gap-2 ${textBase}`}>
          <ArrowLeft size={16} className="opacity-50" />
          <ArrowRight size={16} className="opacity-50" />
          <RotateCw size={14} className="hover:rotate-180 transition-transform duration-500 cursor-pointer" />
        </div>

        {/* L'Input URL (Faux) */}
        <div className={`flex-1 flex items-center ${inputBg} rounded-full h-7 px-3 gap-2 shadow-sm`}>
          <Lock size={12} className="text-green-600" /> {/* Le fameux cadenas sécurisé */}
          <span className={`text-xs font-sans flex-1 truncate select-none ${inputText}`}>
            {/* On retire le https:// visuellement pour faire moderne */}
            {url.replace('https://', '')}
          </span>
          <Star size={14} className="text-gray-400" />
        </div>

        {/* Menu & Avatar */}
        <div className={`flex items-center gap-3 ${textBase}`}>
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                K
            </div>
            <MoreVertical size={16} />
        </div>

      </div>

      {/* === LE CONTENU DU SITE (Votre App) === */}
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};