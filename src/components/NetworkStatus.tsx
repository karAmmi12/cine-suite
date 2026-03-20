import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Wifi, WifiOff, Smartphone, Copy, CheckCircle } from 'lucide-react';
import { isMobileDevice } from '../core/utils/deviceDetect';

interface NetworkInfo {
  ip: string;
  port: number;
  url: string;
  timestamp: string;
}

export function NetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const isMobile = isMobileDevice();
  
  // Ne pas afficher sur mobile
  if (isMobile) return null;

  // Récupérer l'IP du serveur
  const fetchNetworkInfo = async () => {
    try {
      // Vérifier si on est dans Electron
      const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;
      
      let data: NetworkInfo;
      
      if (isElectron) {
        // Via l'API Electron
        data = await (window as any).electronAPI.getServerIP();
      } else {
        // Via fetch direct (mode dev web)
        const response = await fetch('http://localhost:5001/api/network/ip');
        data = await response.json();
      }

      // Corriger l'URL pour pointer vers le frontend Vite (port 5173)
      const frontendUrl = data.url.replace(':5001', ':5173');
      data = { ...data, url: frontendUrl };

      setNetworkInfo(data);
      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur de connexion au serveur:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  // Copier l'URL dans le presse-papiers
  const copyToClipboard = () => {
    if (networkInfo) {
      navigator.clipboard.writeText(networkInfo.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Rafraîchir périodiquement
  useEffect(() => {
    fetchNetworkInfo();
    
    const interval = setInterval(fetchNetworkInfo, 10000); // Toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[#a9a49b]">
        <div className="w-4 h-4 border-2 border-gray-600 border-t-[#b4975e] rounded-full animate-spin" />
        <span className="text-sm">Connexion au serveur...</span>
      </div>
    );
  }

  if (!isConnected || !networkInfo) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <WifiOff className="w-5 h-5" />
        <span className="text-sm">Serveur déconnecté</span>
        <button
          onClick={fetchNetworkInfo}
          className="ml-2 px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-[#12151bcc] backdrop-blur-sm border border-[#b4975e]/25 rounded-xl p-6 shadow-2xl max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-[#ebe7df]">Serveur Local</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Actif
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg mb-4">
        <QRCode
          value={networkInfo.url}
          size={180}
          level="M"
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[#a9a49b]">
          <Smartphone className="w-4 h-4" />
          <span>Scannez avec votre mobile</span>
        </div>
        
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 border border-[#b4975e]/15">
          <code className="flex-1 text-sm text-[#d1b374] font-mono break-all">
            {networkInfo.url}
          </code>
          <button
            onClick={copyToClipboard}
            className="shrink-0 p-2 hover:bg-white/10 rounded-md transition-colors"
            title="Copier l'URL"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-[#a9a49b]" />
            )}
          </button>
        </div>

        <div className="text-xs text-[#8f8a81]">
          IP: {networkInfo.ip} • Port: {networkInfo.port}
        </div>
      </div>
    </div>
  );
}
