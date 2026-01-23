
// 1. Définition des types de modules supportés

export type ModuleType = 'search' | 'chat' | 'mail' | 'terminal' ;

// 2. Configuration partagée par TOUS les modules (Héritage)
export interface BaseModuleConfig {
  type: ModuleType;
  triggerText: string;    // Le texte que l'acteur doit taper (Magic Typing)
  typingSpeed?: number;   // Vitesse simulée (ms)
  autoSubmit?: boolean;   // Valider automatiquement à la fin du texte ?
}

// --- DÉFINITIONS SPÉCIFIQUES PAR MODULE ---

// Configuration spécifique au module RECHERCHE
export interface SearchResult {
  id: string;
  type: 'organic' | 'ad' | 'news';
  title: string;
  url: string;
  snippet: string;
  date?: string;
  imageUrl?: string;
}

export interface SearchModuleConfig extends BaseModuleConfig {
  type: 'search';
  brandName: string;      // Ex: "FindIt"
  results: SearchResult[];
  brandLogoUrl?: string; // URL ou Base64 (Optionnel)
}

// Configuration spécifique au module CHAT (pour plus tard)
export interface ChatMessage {
  id: string;
  isMe: boolean;        // true = bulle bleue (droite), false = bulle grise (gauche)
  text: string;
  time: string;         // ex: "14:02"
  status?: 'sent' | 'delivered' | 'read'; // Pour les petits "v"
}

export interface ChatModuleConfig extends BaseModuleConfig {
  type: 'chat';
  contactName: string;      // Ex: "Maman" ou "Inconnu"
  contactAvatar?: string;   // URL ou Base64 (Optionnel)
  messagesHistory: ChatMessage[]; // Les messages passés
  messageToType: string;    // Le message que l'acteur va taper
}

// 3. Union discriminante (Le type polymorphe final)
// C'est ce type qui permet à l'app de savoir quel module charger
export type SceneModule = SearchModuleConfig | ChatModuleConfig;

// 4. La structure complète d'une SCÈNE
export interface SceneDefinition {
  id: string;
  meta: {
    projectName: string;  // Ex: "Bureau des Légendes S5"
    sceneName: string;    // Ex: "Seq 4 - Recherche Poison"
    createdAt: string;
  };
  globalSettings: {
    themeId: 'light' | 'dark' | 'retro' | 'hacker';
    zoomLevel: number;    // Pour adapter aux différentes tailles d'écran
    accentColor?: string; // Couleur principale (ex: '#3b82f6')
  };
  module: SceneModule;    // Le contenu actif de la scène
}

