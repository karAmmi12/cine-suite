import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useNetworkStore } from '../store/networkStore';

// Instance singleton partagée entre tous les hooks
let sharedConnection: signalR.HubConnection | null = null;
let isInitializing = false;
let lastRegistration = { role: '', roomId: '', deviceType: '' };

// Callbacks centralisés
const globalCallbacks = {
  projectsDataRequested: new Set<() => void>(),
  receiveProjects: new Set<(data: string) => void>(),
  receiveAction: new Set<(action: any) => void>(),
  receiveStateUpdate: new Set<(state: any) => void>(),
  roomClientsUpdated: new Set<(clients: any[]) => void>(),
};

/**
 * Hook SignalR partagé - Une seule connexion pour toute l'app
 */
export const useSharedSignalR = () => {
  const {
    appMode,
    roomId,
    deviceType,
    isConnected,
    setIsConnected,
    setConnectionId,
    setRoomClients,
    setLastAction,
    setLastStateUpdate,
    roomClients,
  } = useNetworkStore();

  const isMounted = useRef(true);

  // Initialiser la connexion partagée une seule fois
  useEffect(() => {
    if (sharedConnection || isInitializing) {
      // Connexion déjà créée ou en cours
      return;
    }

    isInitializing = true;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    let serverUrl: string;
    if (isMobile || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      serverUrl = `http://${window.location.hostname}:5001/hub/cinema`;
    } else {
      serverUrl = 'http://localhost:5001/hub/cinema';
    }

    console.log('🔌 Creating SHARED SignalR connection:', { serverUrl, appMode, roomId, deviceType });

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(serverUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Événements globaux
    connection.on('ProjectsDataRequested', (_data: unknown) => {
      console.log('📥 ProjectsDataRequested (shared)');
      globalCallbacks.projectsDataRequested.forEach(cb => cb());
    });

    connection.on('ReceiveProjects', (projectsJson: string) => {
      console.log('📥 ReceiveProjects (shared), length:', projectsJson?.length || 0);
      globalCallbacks.receiveProjects.forEach(cb => cb(projectsJson));
    });

    connection.on('ReceiveAction', (action) => {
      console.log('📥 ReceiveAction (shared):', action);
      globalCallbacks.receiveAction.forEach(cb => cb(action));
    });

    connection.on('ReceiveStateUpdate', (state) => {
      console.log('📊 ReceiveStateUpdate (shared):', state);
      globalCallbacks.receiveStateUpdate.forEach(cb => cb(state));
    });

    connection.on('RoomClientsUpdated', (clients) => {
      console.log('👥 RoomClientsUpdated (shared):', clients);
      globalCallbacks.roomClientsUpdated.forEach(cb => cb(clients));
    });

    // Connexion
    connection.start()
      .then(() => {
        console.log('✅ SHARED SignalR connected');
        sharedConnection = connection;
        setIsConnected(true);
        setConnectionId(connection.connectionId || null);
        isInitializing = false;
        lastRegistration = { role: '', roomId: '', deviceType: '' };
      })
      .catch((err) => {
        console.error('❌ SHARED SignalR connection error:', err);
        setIsConnected(false);
        isInitializing = false;
      });

    connection.onreconnected(() => {
      console.log('🔄 SHARED SignalR reconnected');
      setIsConnected(true);
      setConnectionId(connection.connectionId || null);
      lastRegistration = { role: '', roomId: '', deviceType: '' };
    });

    connection.onreconnecting(() => {
      console.log('⏳ SHARED SignalR reconnecting...');
      setIsConnected(false);
    });

    connection.onclose(() => {
      console.log('❌ SHARED SignalR closed');
      setIsConnected(false);
      sharedConnection = null;
      lastRegistration = { role: '', roomId: '', deviceType: '' };
    });

    return () => {
      isMounted.current = false;
    };
  }, [appMode, deviceType, roomId, setIsConnected, setConnectionId]);

  // Enregistrement auprès du hub
  useEffect(() => {
    if (!sharedConnection || !isConnected) return;

    const role = appMode || 'standalone';
    const actualRoomId = (appMode === 'controller' || appMode === 'screen') ? (roomId || '') : '';
    const actualDeviceType = deviceType;

    // Ne pas ré-enregistrer si rien n'a changé
    if (lastRegistration.role === role &&
        lastRegistration.roomId === actualRoomId &&
        lastRegistration.deviceType === actualDeviceType) return;

    console.log('🎭 Registering shared client:', { role, actualRoomId, actualDeviceType });

    sharedConnection.invoke('RegisterClient', role, actualRoomId || null, actualDeviceType)
      .then(() => {
        console.log('✅ SHARED client registered as', role, 'in room', actualRoomId || 'none');
        lastRegistration = { role, roomId: actualRoomId, deviceType: actualDeviceType };
      })
      .catch((err) => {
        console.error('❌ Registration error:', err);
      });
  }, [isConnected, appMode, roomId, deviceType]);

  // Actions
  const requestProjectsData = useCallback(async () => {
    if (!sharedConnection || !isConnected) {
      console.error('❌ Cannot request projects: not connected');
      return;
    }
    try {
      await sharedConnection.invoke('RequestProjectsData');
      console.log('📤 Requested projects (shared)');
    } catch (err) {
      console.error('❌ Error requesting projects:', err);
    }
  }, [isConnected]);

  const broadcastProjects = useCallback(async (projectsJson: string) => {
    if (!sharedConnection || !isConnected) {
      console.error('❌ Cannot broadcast: not connected');
      return;
    }
    try {
      await sharedConnection.invoke('BroadcastProjects', projectsJson);
      console.log('📤 Broadcasted projects (shared), length:', projectsJson.length);
    } catch (err) {
      console.error('❌ Error broadcasting:', err);
    }
  }, [isConnected]);

  const sendAction = useCallback(async (actionType: string, payload?: any) => {
    if (!sharedConnection || !roomId) {
      console.error('❌ Cannot send action');
      return;
    }
    try {
      await sharedConnection.invoke('SendAction', roomId, actionType, payload);
      console.log('📤 Action sent (shared):', actionType);
    } catch (err) {
      console.error('❌ Error sending action:', err);
    }
  }, [roomId]);

  const sendStateUpdate = useCallback(async (stateType: string, data?: any) => {
    if (!sharedConnection || !roomId) {
      console.error('❌ Cannot send state');
      return;
    }
    try {
      await sharedConnection.invoke('SendStateUpdate', roomId, stateType, data);
      console.log('📤 State sent (shared):', stateType);
    } catch (err) {
      console.error('❌ Error sending state:', err);
    }
  }, [roomId]);

  const getRoomClients = useCallback(async () => {
    if (!sharedConnection || !roomId) return;
    try {
      await sharedConnection.invoke('GetRoomClients', roomId);
    } catch (err) {
      console.error('❌ Error getting room clients:', err);
    }
  }, [roomId]);

  // Callbacks
  const onProjectsDataRequested = useCallback((callback: () => void) => {
    globalCallbacks.projectsDataRequested.add(callback);
    return () => { globalCallbacks.projectsDataRequested.delete(callback); };
  }, []);

  const onReceiveProjects = useCallback((callback: (data: string) => void) => {
    globalCallbacks.receiveProjects.add(callback);
    return () => { globalCallbacks.receiveProjects.delete(callback); };
  }, []);

  // Synchroniser les actions avec le store
  useEffect(() => {
    const handleAction = (action: any) => {
      setLastAction({
        type: action.actionType,
        payload: action.payload,
        senderId: action.senderId,
        timestamp: action.timestamp
      });
    };
    globalCallbacks.receiveAction.add(handleAction);
    return () => { globalCallbacks.receiveAction.delete(handleAction); };
  }, [setLastAction]);

  useEffect(() => {
    const handleStateUpdate = (state: any) => {
      setLastStateUpdate(state);
    };
    globalCallbacks.receiveStateUpdate.add(handleStateUpdate);
    return () => { globalCallbacks.receiveStateUpdate.delete(handleStateUpdate); };
  }, [setLastStateUpdate]);

  useEffect(() => {
    const handleRoomClients = (clients: any[]) => {
      setRoomClients(clients);
    };
    globalCallbacks.roomClientsUpdated.add(handleRoomClients);
    return () => { globalCallbacks.roomClientsUpdated.delete(handleRoomClients); };
  }, [setRoomClients]);

  return {
    isConnected,
    roomClients,
    requestProjectsData,
    broadcastProjects,
    onProjectsDataRequested,
    onReceiveProjects,
    sendAction,
    sendStateUpdate,
    getRoomClients,
  };
};
