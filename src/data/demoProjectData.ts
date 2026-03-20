import type { Project } from '../core/store/projectStore';

export const createDefaultProject = (): Project => ({
  id: 'demo-project',
  name: 'Projet Démo',
  description: 'Projet de démonstration avec scène email',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      id: 'demo-mail',
      meta: {
        projectName: 'Projet Démo',
        sceneName: 'Emails Confidentiels',
        createdAt: new Date().toISOString()
      },
      globalSettings: {
        themeId: 'dark',
        zoomLevel: 1,
        accentColor: '#8b5cf6'
      },
      module: {
        type: 'mail',
        triggerText: 'Contenu confidentiel...',
        typingSpeed: 50,
        autoSubmit: true,
        userEmail: 'alex.martin@techcorp.com',
        emails: [
          {
            id: '1',
            senderName: 'Direction',
            senderEmail: 'direction@techcorp.com',
            subject: 'CONFIDENTIEL - Restructuration',
            date: new Date(Date.now() - 86400000).toISOString(),
            preview: 'Suite à notre réunion...',
            read: false,
            starred: true,
            important: true,
            labels: ['important', 'urgent'],
            folder: 'inbox' as const,
            body: `Cher Alex,

Suite à notre réunion d'hier, je confirme la restructuration complète du département.

Les détails suivants doivent rester strictement confidentiels :
- 15 postes seront supprimés
- Annonce officielle le 30 mars
- Package de départ prévu

Merci de votre discrétion.

Cordialement,
La Direction`
          },
          {
            id: '2',
            senderName: 'Sarah Chen',
            senderEmail: 'sarah.chen@techcorp.com',
            subject: 'Fuite de données - URGENT',
            date: new Date(Date.now() - 7200000).toISOString(),
            preview: 'J\'ai découvert quelque chose...',
            read: false,
            starred: true,
            important: true,
            labels: ['urgent'],
            folder: 'inbox' as const,
            body: `Alex,

J'ai découvert une faille de sécurité majeure dans nos systèmes.

Des données clients ont été exposées pendant 48h. Je ne sais pas si je dois en parler à la direction car cela pourrait me coûter mon poste.

Peux-tu m'aider à décider quoi faire ?

Sarah`
          },
          {
            id: '3',
            senderName: 'Recrutement',
            senderEmail: 'rh@competitor.com',
            subject: 'Opportunité - Salaire x2',
            date: new Date(Date.now() - 172800000).toISOString(),
            preview: 'Nous avons une proposition...',
            read: true,
            starred: false,
            folder: 'inbox' as const,
            labels: [],
            body: `Bonjour Alex,

Nous avons remarqué votre profil et aimerions vous proposer un poste similaire au vôtre avec :
- Salaire doublé
- Télétravail complet
- Stock options

Seriez-vous intéressé pour en discuter discrètement ?

Cordialement,
L'équipe RH`
          }
        ]
      }
    }
  ]
});
