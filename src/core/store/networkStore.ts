import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types pour le système de rôles
export type AppMode = 'controller' | 'screen' | 'standalone' | null;
export type DeviceType = 'mobile' | 'desktop';

export interface RoomClient {
  connectionId: string;
  role: string;
  deviceType: string;
  connectedAt: string;
}

export interface NetworkState {
  // Configuration du rôle
  appMode: AppMode;
  roomId: string | null;
  deviceType: DeviceType;
  
  // État de connexion
  isConnected: boolean;
  connectionId: string | null;
  
  // Clients dans la room
  roomClients: RoomClient[];
  
  // Actions reçues (pour les screens)
  lastAction: {
    type: string;
    payload: any;
    senderId: string;
    timestamp: string;
  } | null;
  
  // État envoyé (pour les controllers)
  lastStateUpdate: {
    type: string;
    data: any;
    timestamp: string;
  } | null;
  
  // Actions
  setAppMode: (mode: AppMode) => void;
  setRoomId: (roomId: string | null) => void;
  setDeviceType: (deviceType: DeviceType) => void;
  setIsConnected: (isConnected: boolean) => void;
  setConnectionId: (connectionId: string | null) => void;
  setRoomClients: (clients: RoomClient[]) => void;
  setLastAction: (action: any) => void;
  setLastStateUpdate: (state: any) => void;
  reset: () => void;
}

// Générer un ID unique pour cet appareil (ne change jamais)
// Utilise plusieurs facteurs pour garantir l'unicité même avec iCloud sync
const getDeviceId = () => {
  // Utiliser userAgent + screen dimensions pour différencier les appareils
  const userAgent = navigator.userAgent;
  const screenInfo = `${screen.width}x${screen.height}-${screen.availWidth}x${screen.availHeight}`;
  const deviceFingerprint = `${userAgent}-${screenInfo}`;
  
  // Créer une clé spécifique pour cette combinaison d'appareil
  const storageKey = `cinesuite-device-id-${btoa(deviceFingerprint).slice(0, 20)}`;
  
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
    console.log('🆔 New device ID created:', deviceId, 'for', storageKey);
  } else {
    console.log('🆔 Existing device ID loaded:', deviceId, 'from', storageKey);
  }
  return deviceId;
};

const DEVICE_ID = getDeviceId();

const initialState = {
  appMode: null,
  roomId: null,
  deviceType: (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop') as DeviceType,
  isConnected: false,
  connectionId: null,
  roomClients: [],
  lastAction: null,
  lastStateUpdate: null,
};

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAppMode: (mode) => set({ appMode: mode }),
      setRoomId: (roomId) => set({ roomId }),
      setDeviceType: (deviceType) => set({ deviceType }),
      setIsConnected: (isConnected) => set({ isConnected }),
      setConnectionId: (connectionId) => set({ connectionId }),
      setRoomClients: (clients) => set({ roomClients: clients }),
      setLastAction: (action) => set({ lastAction: action }),
      setLastStateUpdate: (state) => set({ lastStateUpdate: state }),
      
      reset: () => set(initialState),
    }),
    {
      // Chaque appareil a son propre storage avec un ID unique
      name: `cinesuite-network-${DEVICE_ID}`,
      // ⚠️ IMPORTANT: Utiliser sessionStorage au lieu de localStorage
      // pour éviter la synchronisation iCloud entre appareils Apple
      storage: createJSONStorage(() => sessionStorage),
      // Ne persister que les préférences, pas l'état de connexion
      partialize: (state) => ({
        appMode: state.appMode,
        roomId: state.roomId,
        deviceType: state.deviceType,
      }),
    }
  )
);
