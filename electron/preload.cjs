const { contextBridge, ipcRenderer } = require('electron');

// Exposer des APIs sécurisées au processus de rendu (React)
contextBridge.exposeInMainWorld('electronAPI', {
  // Informations sur l'environnement
  platform: process.platform,
  // On ne peut pas utiliser __dirname ici car contextIsolation est activé
  // L'info n'est pas nécessaire côté frontend de toute façon
  
  // Obtenir l'IP locale du serveur
  getServerIP: async () => {
    try {
      const response = await fetch('http://localhost:5001/api/network/ip');
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'IP:', error);
      return null;
    }
  },

  // Vérifier si le serveur est actif
  checkServerHealth: async () => {
    try {
      const response = await fetch('http://localhost:5001/api/network/ip', {
        method: 'GET',
        timeout: 3000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
});

// Log pour debug
console.log('✅ Preload script chargé');
console.log('📱 Plateforme:', process.platform);
