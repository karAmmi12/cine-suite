import type { ReactNode } from 'react';
import { Search, MessageCircle, Mail, Terminal, Play } from 'lucide-react';

/**
 * Retourne l'icône Lucide correspondant à un type de module.
 */
export const getModuleIcon = (type: string, size: number = 20): ReactNode => {
  switch (type) {
    case 'search': return <Search size={size} />;
    case 'chat': return <MessageCircle size={size} />;
    case 'mail': return <Mail size={size} />;
    case 'terminal': return <Terminal size={size} />;
    default: return <Play size={size} />;
  }
};

/**
 * Retourne les classes CSS de gradient pour un type de module (usage header/badge).
 */
export const getModuleGradient = (type: string): string => {
  switch (type) {
    case 'search': return 'from-blue-600 to-cyan-600';
    case 'chat': return 'from-green-600 to-emerald-600';
    case 'mail': return 'from-red-600 to-pink-600';
    case 'terminal': return 'from-amber-600 to-orange-600';
    default: return 'from-gray-600 to-gray-700';
  }
};

/**
 * Retourne la classe CSS de couleur de texte pour un type de module (usage inline).
 */
export const getModuleTextColor = (type: string): string => {
  switch (type) {
    case 'search': return 'text-blue-400';
    case 'chat': return 'text-green-400';
    case 'mail': return 'text-red-400';
    case 'terminal': return 'text-amber-400';
    default: return 'text-gray-400';
  }
};
