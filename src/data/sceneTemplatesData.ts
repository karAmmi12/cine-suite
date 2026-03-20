import type { ModuleType } from '../core/types/schema';

export interface SceneTemplateData {
  id: string;
  name: string;
  description: string;
  type: ModuleType;
  module: Record<string, unknown>;
  globalSettings?: {
    themeId: string;
    zoomLevel: number;
    accentColor: string;
  };
}

export const sceneTemplatesData: SceneTemplateData[] = [
  {
    id: '1',
    name: 'Détective numérique',
    description: 'Enquête sur une personne disparue avec recherches compromettantes',
    type: 'search',
    module: {
      type: 'search',
      queries: [
        'sophia laurent disparition',
        'sophia laurent dernière localisation',
        'clinic hope bay area'
      ],
      results: [
        {
          title: 'Sophia Laurent - Personne disparue depuis 72h',
          url: 'https://missingpersons.gov/sophia-laurent',
          snippet: 'Sophia Laurent, 28 ans, vue pour la dernière fois à proximité de la Hope Clinic. Toute information...'
        },
        {
          title: 'Hope Clinic - Essais cliniques controversés',
          url: 'https://medicalethics.org/hope-clinic-investigation',
          snippet: 'La Hope Clinic fait l\'objet d\'une enquête pour essais cliniques non autorisés...'
        }
      ],
      triggerText: 'sophia laurent disparition'
    },
    globalSettings: {
      themeId: 'light',
      zoomLevel: 100,
      accentColor: '#4f46e5'
    }
  },
  {
    id: '2',
    name: 'Dossier médical compromettant',
    description: 'Recherches médicales révélant un scandale pharmaceutique',
    type: 'search',
    module: {
      type: 'search',
      queries: [
        'neurostim-x effets secondaires',
        'dr marcus chen sanctions',
        'neurostim-x décès patients'
      ],
      results: [
        {
          title: 'NeurostiM-X : Les effets secondaires cachés',
          url: 'https://pharmawhistle.com/neurostim-investigation',
          snippet: 'Un médicament révolutionnaire ou une bombe à retardement ? 12 décès suspects en 6 mois...'
        },
        {
          title: 'Dr Marcus Chen radié de l\'ordre des médecins',
          url: 'https://medical-board.gov/sanctions/chen-marcus',
          snippet: 'Radiation définitive pour expérimentation non éthique sur patients vulnérables...'
        }
      ],
      triggerText: 'neurostim-x effets secondaires'
    },
    globalSettings: {
      themeId: 'light',
      zoomLevel: 100,
      accentColor: '#dc2626'
    }
  },
  {
    id: '3',
    name: 'Menace directe',
    description: 'Conversation tendue avec un mystérieux contact',
    type: 'chat',
    module: {
      type: 'chat',
      contact: {
        name: 'Inconnu',
        avatar: '❓',
        status: 'En ligne'
      },
      messages: [
        { sender: 'them', text: 'Tu as fait une grosse erreur.', timestamp: '23:47' },
        { sender: 'them', text: 'Tu crois que personne ne te surveille ?', timestamp: '23:48' },
        { sender: 'them', text: 'Tu as 48h pour tout effacer.', timestamp: '23:49' },
        { sender: 'them', text: 'Sinon tout le monde saura ce que tu as fait.', timestamp: '23:50' }
      ],
      messageToType: 'Qui êtes-vous ?',
      triggerText: 'Qui êtes-vous ?'
    },
    globalSettings: {
      themeId: 'dark',
      zoomLevel: 100,
      accentColor: '#dc2626'
    }
  },
  {
    id: '4',
    name: 'Liaison secrète',
    description: 'Messages révélant une affaire extraconjugale',
    type: 'chat',
    module: {
      type: 'chat',
      contact: {
        name: 'Alex',
        avatar: '💋',
        status: 'Actif il y a 2 min'
      },
      messages: [
        { sender: 'them', text: 'Il/Elle ne se doute de rien...', timestamp: '22:15' },
        { sender: 'me', text: 'On doit être plus prudents', timestamp: '22:16' },
        { sender: 'them', text: 'Rendez-vous habituel demain ?', timestamp: '22:17' },
        { sender: 'me', text: 'Même hôtel, même chambre', timestamp: '22:18' }
      ],
      messageToType: 'On doit parler...',
      triggerText: 'On doit parler...'
    },
    globalSettings: {
      themeId: 'dark',
      zoomLevel: 100,
      accentColor: '#ec4899'
    }
  },
  {
    id: '5',
    name: 'Chantage financier',
    description: 'Emails de menaces et demandes de rançon',
    type: 'mail',
    module: {
      type: 'mail',
      emails: [
        {
          id: '1',
          from: 'anonymous@darkmail.onion',
          subject: 'Tu me dois 50 000€',
          preview: 'J\'ai toutes les preuves de ton détournement. Virement sous 48h ou...',
          body: 'J\'ai toutes les preuves de ton détournement de fonds. Virement de 50 000€ sous 48h sur le compte Bitcoin ci-dessous, ou j\'envoie tout à la police et à ta direction.\n\nBTC: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\n\nTu as jusqu\'à vendredi 23h59.',
          date: '2024-01-15',
          read: false,
          starred: true
        },
        {
          id: '2',
          from: 'anonymous@darkmail.onion',
          subject: 'Rappel : Plus que 24h',
          preview: 'Le temps presse. J\'espère que tu as compris la gravité de la situation...',
          body: 'Le temps presse. J\'espère que tu as compris la gravité de la situation. Plus que 24h avant que tout le monde sache.',
          date: '2024-01-16',
          read: false,
          starred: false
        }
      ],
      triggerText: '50 000'
    },
    globalSettings: {
      themeId: 'light',
      zoomLevel: 100,
      accentColor: '#dc2626'
    }
  },
  {
    id: '6',
    name: 'Harcèlement professionnel',
    description: 'Série de messages agressifs d\'un supérieur',
    type: 'mail',
    module: {
      type: 'mail',
      emails: [
        {
          id: '1',
          from: 'r.anderson@techcorp.com',
          subject: 'Ton incompétence me fatigue',
          preview: 'Tu es vraiment le pire recrutement qu\'on ait fait. Tu ne mérites pas...',
          body: 'Tu es vraiment le pire recrutement qu\'on ait fait. Tu ne mérites pas ton salaire. Si tu continues comme ça, tu vas te retrouver à la rue.',
          date: '2024-01-10',
          read: true,
          starred: false
        },
        {
          id: '2',
          from: 'r.anderson@techcorp.com',
          subject: 'Réunion lundi - sois à l\'heure pour une fois',
          preview: 'On va discuter de tes performances pathétiques. Prépare-toi...',
          body: 'On va discuter de tes performances pathétiques. Prépare-toi à entendre des vérités qui font mal.',
          date: '2024-01-12',
          read: true,
          starred: false
        }
      ],
      triggerText: 'incompétence'
    },
    globalSettings: {
      themeId: 'light',
      zoomLevel: 100,
      accentColor: '#f59e0b'
    }
  },
  {
    id: '7',
    name: 'Infiltration FBI',
    description: 'Terminal d\'infiltration dans un système sécurisé',
    type: 'terminal',
    module: {
      type: 'terminal',
      sequences: [
        { text: '$ ssh -p 2222 admin@fbi-secure-server.gov', delay: 0 },
        { text: '\nThe authenticity of host \'fbi-secure-server.gov (198.51.100.42)\' can\'t be established.', delay: 400 },
        { text: '\nECDSA key fingerprint is SHA256:k3X9/fL2mP8qR5tN7wY1vZ4cB6dE8fG0hJ2iK4lM6n.', delay: 300 },
        { text: '\nAre you sure you want to continue connecting (yes/no)? yes', delay: 800 },
        { text: '\nWarning: Permanently added \'fbi-secure-server.gov\' (ECDSA) to known hosts.', delay: 400 },
        { text: '\nadmin@fbi-secure-server.gov\'s password: ', delay: 600 },
        { text: '\n\nLast login: Sun Jan 26 03:47:22 2026 from 10.0.2.15', delay: 800 },
        { text: '\n[admin@fbi-node ~]$ ls -la /classified/', delay: 600 },
        { text: '\ntotal 42', delay: 400 },
        { text: '\ndrwxr-x---  5 root classified 4096 Jan 25 18:32 .', delay: 200 },
        { text: '\ndrwxr-xr-x 24 root root       4096 Jan 20 09:15 ..', delay: 200 },
        { text: '\n-rw-r-----  1 root classified 8192 Jan 25 18:32 operation_blackout.pdf', delay: 300 },
        { text: '\n-rw-r-----  1 root classified 4096 Jan 24 14:20 witness_protection_list.xlsx', delay: 300 },
        { text: '\n-rw-r-----  1 root classified 2048 Jan 23 11:05 undercover_agents_2024.db', delay: 300 },
        { text: '\n\n[admin@fbi-node ~]$ cat /var/log/auth.log | tail -n 1', delay: 800 },
        { text: '\nJan 27 00:24:18 fbi-node sshd[8472]: Accepted password for admin from 203.0.113.89 port 54321 ssh2', delay: 600 },
        { text: '\n\n[admin@fbi-node ~]$ sudo iptables -L | grep 203.0.113', delay: 1000 },
        { text: '\n\n*** WARNING: Unauthorized access detected from IP 203.0.113.89 ***', delay: 1200 },
        { text: '\n*** Initiating trace route...', delay: 600 },
        { text: '\n*** Logging session to /var/log/intrusion.log', delay: 500 },
        { text: '\n\nConnection to fbi-secure-server.gov closed by remote host.', delay: 800 },
        { text: '\nConnection to fbi-secure-server.gov closed.', delay: 400 }
      ],
      triggerText: 'ssh -p 2222 admin@fbi'
    },
    globalSettings: {
      themeId: 'dark',
      zoomLevel: 100,
      accentColor: '#3b82f6'
    }
  },
  {
    id: '8',
    name: 'Hack cryptomonnaie',
    description: 'Extraction de fonds d\'un wallet crypto',
    type: 'terminal',
    module: {
      type: 'terminal',
      sequences: [
        { text: '$ python3 exploit.py --target 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', delay: 0 },
        { text: '\n[+] Loading Web3 provider...', delay: 500 },
        { text: '\n[+] Connected to Ethereum mainnet (chainId: 1)', delay: 600 },
        { text: '\n[+] Current gas price: 45 gwei', delay: 400 },
        { text: '\n\n[*] Analyzing target wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', delay: 800 },
        { text: '\n[*] Balance: 127.45 ETH ($245,892.17 USD)', delay: 700 },
        { text: '\n[*] Last transaction: 2 days ago', delay: 400 },
        { text: '\n[*] Nonce: 847', delay: 300 },
        { text: '\n\n[*] Scanning smart contracts...', delay: 1000 },
        { text: '\n[!] Found vulnerable contract at 0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', delay: 900 },
        { text: '\n[!] Vulnerability: Reentrancy in withdrawBalance()', delay: 700 },
        { text: '\n[!] Exploit available: YES', delay: 600 },
        { text: '\n\n[*] Preparing exploit transaction...', delay: 800 },
        { text: '\n[*] Estimating gas: 284,592 units', delay: 500 },
        { text: '\n[*] Transaction cost: 0.0128 ETH', delay: 400 },
        { text: '\n\n[+] Broadcasting transaction: 0xa3f20717fc090a9c934b1e9b8a8e8a3e...', delay: 1200 },
        { text: '\n[+] Transaction confirmed in block #18,745,892', delay: 1500 },
        { text: '\n[+] 127.45 ETH transferred to 0x1A2b3C4d5E6f7G8h9I0j...', delay: 1000 },
        { text: '\n\n[*] Routing through Tornado Cash mixer...', delay: 900 },
        { text: '\n[+] Privacy pool: 100 ETH', delay: 600 },
        { text: '\n[+] Anonymity set: 1,247 deposits', delay: 500 },
        { text: '\n[+] Note commitment: 0x2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c...', delay: 700 },
        { text: '\n\n[+] Withdrawal complete. Funds secured.', delay: 800 },
        { text: '\n[+] Trace analysis: ORIGIN OBFUSCATED', delay: 500 },
        { text: '\n\n$ exit', delay: 600 }
      ],
      triggerText: 'python3 exploit.py --target'
    },
    globalSettings: {
      themeId: 'dark',
      zoomLevel: 100,
      accentColor: '#10b981'
    }
  }
];
