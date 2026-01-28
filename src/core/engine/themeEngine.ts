/**
 * 🎨 THEME ENGINE - Système centralisé de gestion des thèmes
 * Permet de basculer instantanément entre différents univers visuels
 */

export type ThemeId = 
  | 'modern' 
  | 'retro-2000' 
  | 'retro-90' 
  | 'yahoo-2005' 
  | 'altavista-98' 
  | 'windows-98' 
  | 'hacker-terminal'
  | 'dark-mode'
  | 'corporate';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  category: 'modern' | 'retro' | 'professional';
  cssVariables: {
    // Couleurs
    '--bg-primary': string;
    '--bg-secondary': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--accent': string;
    '--border': string;
    
    // Typographie
    '--font-family': string;
    '--font-size-base': string;
    '--line-height': string;
    
    // Espacements
    '--spacing-unit': string;
    
    // Effets
    '--shadow': string;
    '--radius': string;
  };
}

export const themes: Record<ThemeId, ThemeDefinition> = {
  'modern': {
    id: 'modern',
    name: 'Moderne',
    category: 'modern',
    cssVariables: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f9fafb',
      '--text-primary': '#111827',
      '--text-secondary': '#6b7280',
      '--accent': '#3b82f6',
      '--border': '#e5e7eb',
      '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '--font-size-base': '16px',
      '--line-height': '1.6',
      '--spacing-unit': '8px',
      '--shadow': '0 1px 3px rgba(0,0,0,0.1)',
      '--radius': '8px',
    }
  },
  
  'dark-mode': {
    id: 'dark-mode',
    name: 'Dark Mode',
    category: 'modern',
    cssVariables: {
      '--bg-primary': '#1f2937',
      '--bg-secondary': '#111827',
      '--text-primary': '#f9fafb',
      '--text-secondary': '#9ca3af',
      '--accent': '#60a5fa',
      '--border': '#374151',
      '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '--font-size-base': '16px',
      '--line-height': '1.6',
      '--spacing-unit': '8px',
      '--shadow': '0 4px 6px rgba(0,0,0,0.3)',
      '--radius': '8px',
    }
  },
  
  'retro-90': {
    id: 'retro-90',
    name: 'Années 90',
    category: 'retro',
    cssVariables: {
      '--bg-primary': '#c0c0c0',
      '--bg-secondary': '#ffffff',
      '--text-primary': '#000000',
      '--text-secondary': '#000080',
      '--accent': '#ff0000',
      '--border': '#000000',
      '--font-family': 'Arial, sans-serif',
      '--font-size-base': '14px',
      '--line-height': '1.4',
      '--spacing-unit': '4px',
      '--shadow': '4px 4px 0 rgba(0,0,0,1)',
      '--radius': '0px',
    }
  },
  
  'retro-2000': {
    id: 'retro-2000',
    name: 'Années 2000',
    category: 'retro',
    cssVariables: {
      '--bg-primary': '#dbeafe',
      '--bg-secondary': '#ffffff',
      '--text-primary': '#1e3a8a',
      '--text-secondary': '#3b82f6',
      '--accent': '#2563eb',
      '--border': '#1e40af',
      '--font-family': 'Verdana, sans-serif',
      '--font-size-base': '13px',
      '--line-height': '1.5',
      '--spacing-unit': '6px',
      '--shadow': '2px 2px 5px rgba(0,0,0,0.2)',
      '--radius': '3px',
    }
  },
  
  'yahoo-2005': {
    id: 'yahoo-2005',
    name: 'Yahoo 2005',
    category: 'retro',
    cssVariables: {
      '--bg-primary': '#f3e5f5',
      '--bg-secondary': '#ffffff',
      '--text-primary': '#4a148c',
      '--text-secondary': '#7b1fa2',
      '--accent': '#9c27b0',
      '--border': '#6a1b9a',
      '--font-family': 'Verdana, Arial, sans-serif',
      '--font-size-base': '12px',
      '--line-height': '1.4',
      '--spacing-unit': '5px',
      '--shadow': 'none',
      '--radius': '2px',
    }
  },
  
  'altavista-98': {
    id: 'altavista-98',
    name: 'AltaVista 1998',
    category: 'retro',
    cssVariables: {
      '--bg-primary': '#ffffcc',
      '--bg-secondary': '#ffff99',
      '--text-primary': '#000000',
      '--text-secondary': '#0000ee',
      '--accent': '#0000ee',
      '--border': '#000000',
      '--font-family': 'Courier New, monospace',
      '--font-size-base': '13px',
      '--line-height': '1.8',
      '--spacing-unit': '4px',
      '--shadow': 'none',
      '--radius': '0px',
    }
  },
  
  'windows-98': {
    id: 'windows-98',
    name: 'Windows 98',
    category: 'retro',
    cssVariables: {
      '--bg-primary': '#008080',
      '--bg-secondary': '#c0c0c0',
      '--text-primary': '#000000',
      '--text-secondary': '#000080',
      '--accent': '#000080',
      '--border': '#808080',
      '--font-family': 'MS Sans Serif, Arial, sans-serif',
      '--font-size-base': '11px',
      '--line-height': '1.3',
      '--spacing-unit': '2px',
      '--shadow': 'none',
      '--radius': '0px',
    }
  },
  
  'hacker-terminal': {
    id: 'hacker-terminal',
    name: 'Terminal Hacker',
    category: 'professional',
    cssVariables: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#0a0a0a',
      '--text-primary': '#00ff00',
      '--text-secondary': '#00aa00',
      '--accent': '#00ff00',
      '--border': '#00aa00',
      '--font-family': '"Courier New", "Consolas", monospace',
      '--font-size-base': '14px',
      '--line-height': '1.5',
      '--spacing-unit': '8px',
      '--shadow': '0 0 10px rgba(0,255,0,0.3)',
      '--radius': '0px',
    }
  },
  
  'corporate': {
    id: 'corporate',
    name: 'Corporate',
    category: 'professional',
    cssVariables: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8fafc',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--accent': '#0ea5e9',
      '--border': '#cbd5e1',
      '--font-family': '"Inter", -apple-system, sans-serif',
      '--font-size-base': '15px',
      '--line-height': '1.6',
      '--spacing-unit': '8px',
      '--shadow': '0 1px 2px rgba(0,0,0,0.05)',
      '--radius': '4px',
    }
  },
};

/**
 * Applique un thème en injectant les CSS Variables dans le DOM
 */
export const applyTheme = (themeId: ThemeId): void => {
  const theme = themes[themeId];
  if (!theme) {
    console.error(`Theme "${themeId}" not found`);
    return;
  }
  
  const root = document.documentElement;
  Object.entries(theme.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Sauvegarde dans localStorage pour persistance
  localStorage.setItem('cinesuite-theme', themeId);
};

/**
 * Récupère le thème actuel depuis localStorage
 */
export const getCurrentTheme = (): ThemeId => {
  const saved = localStorage.getItem('cinesuite-theme') as ThemeId;
  return saved && themes[saved] ? saved : 'modern';
};

/**
 * Initialise le thème au démarrage de l'app
 */
export const initializeTheme = (): void => {
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
};
