const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;
let dotnetProcess;

// Chemin vers le serveur .NET selon la plateforme
function getDotnetServerPath() {
  const platform = process.platform;
  const isDev = !app.isPackaged;

  if (isDev) {
    // En développement, on utilise le projet .NET directement
    return {
      command: 'dotnet',
      args: ['run', '--project', path.join(__dirname, '..', 'backend', 'CineSuite.Server.csproj')],
      cwd: path.join(__dirname, '..')
    };
  }

  // En production, on utilise le binaire compilé
  let serverPath;
  if (platform === 'darwin') {
    serverPath = path.join(process.resourcesPath, 'server', 'osx-arm64', 'CineSuite.Server');
  } else if (platform === 'win32') {
    serverPath = path.join(process.resourcesPath, 'server', 'win-x64', 'CineSuite.Server.exe');
  } else {
    throw new Error(`Plateforme non supportée: ${platform}`);
  }

  // Vérifier que le fichier existe
  if (!fs.existsSync(serverPath)) {
    throw new Error(`Serveur .NET introuvable: ${serverPath}`);
  }

  // Sur macOS, s'assurer que le binaire a les droits d'exécution
  if (platform === 'darwin') {
    try {
      fs.chmodSync(serverPath, '755');
      console.log('✅ Droits d\'exécution appliqués au serveur .NET');
    } catch (err) {
      console.error('⚠️ Impossible d\'appliquer les droits d\'exécution:', err);
    }
  }

  return {
    command: serverPath,
    args: [],
    cwd: path.dirname(serverPath)
  };
}

// Démarrer le serveur .NET
async function startDotnetServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Démarrage du serveur .NET...');
    console.log('📦 app.isPackaged:', app.isPackaged);
    console.log('📦 __dirname:', __dirname);
    console.log('📦 process.resourcesPath:', process.resourcesPath);

    // En développement, on suppose que le serveur est déjà lancé
    if (!app.isPackaged) {
      console.log('⚠️ Mode développement : Le serveur doit être déjà lancé via npm run backend:dev');
      
      // Vérifier que le serveur répond
      const checkServer = async () => {
        try {
          const response = await fetch('http://localhost:5001/api/network/ip');
          if (response.ok) {
            console.log('✅ Serveur .NET détecté sur le port 5001');
            resolve();
          } else {
            throw new Error('Serveur ne répond pas correctement');
          }
        } catch (error) {
          reject(new Error('Serveur .NET non accessible sur http://localhost:5001. Lancez d\'abord: npm run backend:dev'));
        }
      };
      
      checkServer();
      return;
    }

    // En production, on lance le serveur
    try {
      const serverConfig = getDotnetServerPath();
      console.log('📁 Server path:', serverConfig.command);
      console.log('📁 Working directory:', serverConfig.cwd);
      
      dotnetProcess = spawn(serverConfig.command, serverConfig.args, {
        cwd: serverConfig.cwd,
        env: {
          ...process.env,
          ASPNETCORE_ENVIRONMENT: app.isPackaged ? 'Production' : 'Development'
        }
      });
      
      console.log('🔄 .NET process spawned with PID:', dotnetProcess.pid);

      // Capturer la sortie standard
      dotnetProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[.NET Server]', output);

        // Détecter que le serveur a démarré
        if (output.includes('Now listening on') || output.includes('CineSuite Server Started')) {
          console.log('✅ Serveur .NET démarré avec succès');
          resolve();
        }
      });

      // Capturer les erreurs
      dotnetProcess.stderr.on('data', (data) => {
        console.error('[.NET Server Error]', data.toString());
      });

      // Gérer la fermeture du processus
      dotnetProcess.on('close', (code) => {
        console.log(`[.NET Server] Processus terminé avec le code ${code}`);
        if (code !== 0 && code !== null) {
          reject(new Error(`Le serveur .NET s'est arrêté avec le code ${code}`));
        }
      });

      dotnetProcess.on('error', (err) => {
        console.error('[.NET Server] Erreur de processus:', err);
        reject(err);
      });

      // Timeout de 10 secondes
      setTimeout(() => {
        if (dotnetProcess && !dotnetProcess.killed) {
          resolve(); // On considère que c'est OK même si pas de message explicite
        }
      }, 10000);

    } catch (error) {
      reject(error);
    }
  });
}

// Arrêter le serveur .NET proprement
function stopDotnetServer() {
  if (dotnetProcess && !dotnetProcess.killed) {
    console.log('🛑 Arrêt du serveur .NET...');
    
    // Sur Windows, on utilise taskkill, sur Unix kill
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', dotnetProcess.pid, '/f', '/t']);
    } else {
      dotnetProcess.kill('SIGTERM');
      
      // Si pas tué après 2 secondes, forcer
      setTimeout(() => {
        if (dotnetProcess && !dotnetProcess.killed) {
          dotnetProcess.kill('SIGKILL');
        }
      }, 2000);
    }
  }
}

// Créer la fenêtre principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'CineSuite',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    backgroundColor: '#000000',
    show: false // Ne pas montrer avant que le contenu soit chargé
  });

  // Charger l'application React
  if (app.isPackaged) {
    // En production, charger le build depuis Resources/dist (pas dans app.asar)
    const distPath = path.join(process.resourcesPath, 'dist', 'index.html');
    console.log('📂 Loading from:', distPath);
    mainWindow.loadFile(distPath).catch(err => {
      console.error('❌ Failed to load:', err);
      // Pas de fallback en production
    });
  } else {
    // En développement, charger Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    
    // Ouvrir les DevTools en développement
    mainWindow.webContents.openDevTools();
  }

  // Afficher la fenêtre quand prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Gérer la fermeture
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialisation de l'application
app.whenReady().then(async () => {
  try {
    // Démarrer le serveur .NET en premier
    await startDotnetServer();
    
    // Puis créer la fenêtre
    createWindow();

  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter proprement quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  stopDotnetServer();
  
  // Sur macOS, les apps restent actives jusqu'à Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Quitter l'application
app.on('will-quit', (event) => {
  stopDotnetServer();
});

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  stopDotnetServer();
});
