import type { SearchModuleConfig, ChatModuleConfig, MailModuleConfig, TerminalModuleConfig } from '../types/schema';

export const defaultSearchConfig: SearchModuleConfig = {
  type: 'search',
  triggerText: '',
  brandName: 'Google',
  theme: 'modern',
  results: [
    {
      id: '1',
      type: 'organic',
      title: 'Wikipedia - Article principal',
      url: 'https://wikipedia.org',
      snippet: 'Encyclopédie libre en ligne',
      favicon: '🌐'
    },
    {
      id: '2',
      type: 'organic',
      title: 'Documentation technique',
      url: 'https://docs.example.com',
      snippet: 'Guide complet et documentation',
      favicon: '📚'
    },
    {
      id: '3',
      type: 'news',
      title: 'Actualité importante',
      url: 'https://news.example.com',
      snippet: 'Dernières nouvelles du jour',
      favicon: '📰'
    }
  ]
};

export const defaultChatConfig: ChatModuleConfig = {
  type: 'chat',
  triggerText: '',
  contactName: 'John Doe',
  theme: 'whatsapp',
  messageToType: '',
  messagesHistory: [
    {
      id: '1',
      isMe: false,
      text: 'Salut ! Comment ça va ?',
      time: '14:30',
      status: 'read'
    },
    {
      id: '2',
      isMe: true,
      text: 'Super ! Et toi ?',
      time: '14:32',
      status: 'read'
    },
    {
      id: '3',
      isMe: false,
      text: 'Ça va bien, merci ! Tu es disponible pour discuter ?',
      time: '14:34',
      status: 'read'
    }
  ]
};

export const defaultMailConfig: MailModuleConfig = {
  type: 'mail',
  triggerText: '',
  userEmail: 'demo@cinesuite.com',
  emails: [
    {
      id: '1',
      senderName: 'Jean Dupont',
      senderEmail: 'jean.dupont@exemple.com',
      subject: 'Réunion de demain',
      preview: 'Bonjour, je voulais confirmer notre réunion de demain à 10h...',
      body: 'Bonjour,\n\nJe voulais confirmer notre réunion de demain à 10h.\n\nCordialement,\nJean Dupont',
      date: '10:30',
      read: false,
      starred: true,
      folder: 'inbox'
    },
    {
      id: '2',
      senderName: 'Marie Martin',
      senderEmail: 'marie.martin@exemple.com',
      subject: 'Documents à signer',
      preview: 'Merci de bien vouloir signer les documents ci-joints...',
      body: 'Merci de bien vouloir signer les documents ci-joints.\n\nMarie Martin',
      date: 'Hier',
      read: false,
      starred: false,
      folder: 'inbox'
    },
    {
      id: '3',
      senderName: 'Newsletter Tech',
      senderEmail: 'newsletter@tech.com',
      subject: 'Les actualités de la semaine',
      preview: 'Découvrez les dernières nouveautés technologiques...',
      body: 'Découvrez les dernières nouveautés technologiques de la semaine.',
      date: '15 Jan',
      read: true,
      starred: false,
      folder: 'inbox'
    }
  ]
};

export const defaultTerminalConfig: TerminalModuleConfig = {
  type: 'terminal',
  triggerText: 'systemctl status',
  color: 'green',
  lines: [
    'Initializing system...',
    'Loading kernel modules... OK',
    'Starting network services...',
    'Connected to network',
    'System ready.'
  ],
  typingSpeed: 'fast',
  showProgressBar: false,
  progressDuration: 5,
  finalMessage: 'SYSTEM READY',
  finalStatus: 'success'
};
