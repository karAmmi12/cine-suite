import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Star, MoreVertical, Menu } from 'lucide-react';
import { isMobileDevice } from '../../core/utils/deviceDetect';

interface BrowserFrameProps {
  children: ReactNode;
  url: string; // L'URL qu'on veut afficher
  theme?: 'light' | 'dark';
}

export const BrowserFrame = ({ children, url, theme = 'light' }: BrowserFrameProps) => {
  const isDark = theme === 'dark';
  const isMobile = isMobileDevice();
  const bgBase = isDark ? 'bg-[#202124]' : 'bg-[#f3f3f3]'; // Couleurs Chrome
  const textBase = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#35363a]' : 'bg-white';
  const inputText = isDark ? 'text-white' : 'text-gray-800';

  if (isMobile) {
    return (
      <div className={`flex flex-col h-dvh w-screen overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
        
        {/* === MOBILE ADDRESS BAR (Safari/Chrome style) === */}
        <div className={`h-14 flex flex-col justify-end pb-2 px-4 border-b ${bgBase} ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className={`w-full flex items-center ${inputBg} rounded-full h-10 px-4 gap-3 shadow-sm mx-auto max-w-sm`}>
            <span className="text-gray-400 text-lg">AA</span>
            <div className="flex-1 flex justify-center items-center gap-1">
              <Lock size={12} className={isDark ? "text-gray-400" : "text-gray-800"} />
              <span className={`text-[15px] font-sans truncate select-none ${inputText}`}>
                {url.replace('https://', '')}
              </span>
            </div>
            <RotateCw size={14} className={textBase} />
          </div>
        </div>

        {/* === CONTENT === */}
        <div className="flex-1 relative overflow-hidden">
          {children}
        </div>
        
        {/* === MOBILE BOTTOM BAR === */}
        <div className={`h-12 flex items-center justify-between px-6 border-t ${bgBase} ${isDark ? 'border-gray-700/50' : 'border-gray-300/50'} ${textBase}`}>
          <ArrowLeft size={20} className="opacity-50" />
          <ArrowRight size={20} className="opacity-50" />
          <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center text-[10px] font-bold">1</div>
          <Star size={20} className="opacity-50" />
          <Menu size={20} className="opacity-50" />
        </div>
      </div>
    );
  }

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

      {/* === LE CONTENU DU SITE === */}
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};