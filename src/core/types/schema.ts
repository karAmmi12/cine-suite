
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
  type: 'organic' | 'ad' | 'news' | 'video' | 'image';
  title: string;
  url: string;
  snippet: string;
  date?: string;
  imageUrl?: string;
  favicon?: string; // Pour plus de réalisme
  author?: string;  // Pour les articles de blog
  readTime?: string; // "5 min read"
  rating?: number;  // Étoiles (pour shopping/reviews)
  price?: string;   // Pour les résultats e-commerce
  // NOUVEAU : Le contenu de la fausse page web
  pageContent?: string;
  // NOUVEAU : Configuration avancée de la page
  pageConfig?: {
    layout?: 'article' | 'blog' | 'news' | 'forum' | 'wiki' | 'ecommerce' | 'portal'; // Type de layout
    headerImage?: string; // Image de bannière
    contentImages?: Array<{ // Images dans le contenu
      url: string;
      caption?: string;
      position?: 'top' | 'inline' | 'side' | 'bottom';
      width?: 'small' | 'medium' | 'large' | 'full';
    }>;
    style?: { // Personnalisation du style
      primaryColor?: string;
      font?: 'serif' | 'sans-serif' | 'mono' | 'cursive';
      textSize?: 'small' | 'medium' | 'large';
      spacing?: 'compact' | 'normal' | 'relaxed';
    };
    sidebar?: { // Contenu latéral
      type?: 'ads' | 'related' | 'author' | 'toc' | 'none';
      content?: string;
    };
    metadata?: { // Métadonnées supplémentaires
      category?: string;
      tags?: string[];
      views?: string;
      comments?: number;
      lastModified?: string;
    };
  };
}

export interface SearchModuleConfig extends BaseModuleConfig {
  type: 'search';
  brandName: string;
  brandLogoUrl?: string;
  theme?: 'modern' | 'retro-2000' | 'retro-90' | 'yahoo-2005' | 'altavista-98' | 'windows-98' | 'hacker-terminal'; // Thème visuel d'époque
  results: SearchResult[];
}

// Configuration spécifique au module CHAT (pour plus tard)
export interface ChatMessage {
  id: string;
  isMe: boolean;        // true = bulle bleue (droite), false = bulle grise (gauche)
  text: string;
  time: string;         // ex: "14:02"
  status?: 'sent' | 'delivered' | 'read'; // Pour les petits "v"
  edited?: boolean;     // Message modifié
  replyTo?: string;     // ID du message auquel on répond
  mediaUrl?: string;    // Photo/vidéo partagée
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  reactions?: string[]; // Emojis de réaction
}

export interface ChatModuleConfig extends BaseModuleConfig {
  type: 'chat';
  contactName: string;      // Ex: "Maman" ou "Inconnu"
  contactAvatar?: string;   // URL ou Base64 (Optionnel)
  contactPhone?: string;    // Numéro de téléphone formaté
  contactStatus?: string;   // "En ligne", "Absent(e)", "Vu(e) il y a 2h"
  isTyping?: boolean;       // Afficher "... est en train d'écrire"
  theme?: 'whatsapp' | 'imessage' | 'telegram' | 'messenger'; // Style d'interface
  messagesHistory: ChatMessage[]; // Les messages passés
  messageToType: string;    // Le message que l'acteur va taper
}

// --- CONFIGURATION MAIL ---

export interface MailMessage {
  id: string;
  senderName: string;
  senderEmail: string; // ex: boss@evilcorp.com
  subject: string;
  preview: string;     // Le début du texte qu'on voit dans la liste
  body: string;        // Le contenu complet (support HTML basique)
  date: string;
  read: boolean;       // Lu ou Non lu (Gras ou pas gras)
  starred?: boolean;   // Étoile favorite
  important?: boolean; // Marqueur d'importance
  labels?: string[];   // ["Travail", "Urgent", "Personnel"]
  attachments?: Array<{ name: string; size: string; type: string }>;
  threadId?: string;   // Pour regrouper les conversations
  folder: 'inbox' | 'sent' | 'trash' | 'spam' | 'drafts';
}

export interface MailModuleConfig extends BaseModuleConfig {
  type: 'mail';
  userEmail: string;      // L'adresse du personnage (ex: heros@gmail.com)
  userName?: string;      // Nom complet
  userAvatar?: string;    // Photo du personnage
  provider?: 'gmail' | 'outlook' | 'yahoo' | 'protonmail'; // Style d'interface
  emails: MailMessage[];  // La liste des mails
  activeEmailId?: string; // Quel mail est ouvert actuellement ?
  folders?: Array<{ name: string; count: number; icon?: string }>; // Dossiers personnalisés
  inboxCount?: number;    // Nombre de mails non lus
}


export interface TerminalModuleConfig extends Omit<BaseModuleConfig, 'typingSpeed'> {
  type: 'terminal';
  color: 'green' | 'red' | 'blue' | 'amber'; // Le style (Matrix, Alerte, Police...)
  lines: string[];        // Les fausses lignes de code qui défilent
  typingSpeed: 'slow' | 'fast' | 'instant';
  showProgressBar: boolean;
  progressDuration: number; // En secondes
  finalMessage: string;   // Ex: "ACCESS GRANTED"
  finalStatus: 'success' | 'error';
}

// 3. Union discriminante (Le type polymorphe final)
// C'est ce type qui permet à l'app de savoir quel module charger
export type SceneModule = SearchModuleConfig | ChatModuleConfig | MailModuleConfig | TerminalModuleConfig ;
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
    aiKey?: string;     // Clé API AI personnalisée (optionnelle)
  };
  module: SceneModule;    // Le contenu actif de la scène
}

