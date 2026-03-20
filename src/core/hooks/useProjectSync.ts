import { useState, useEffect } from 'react';
import { useSharedSignalR } from './useSharedSignalR';
import { useNetworkStore } from '../store/networkStore';
import { useProjectStore } from '../store/projectStore';
import type { Project } from '../store/projectStore';

/**
 * Hook qui synchronise les projets entre desktop et mobile via SignalR.
 * - Desktop : répond aux demandes de projets
 * - Mobile : demande et reçoit les projets du desktop
 */
export const useProjectSync = () => {
  const { isConnected, requestProjectsData, onReceiveProjects, broadcastProjects, onProjectsDataRequested } = useSharedSignalR();
  const { deviceType } = useNetworkStore();
  const localProjects = useProjectStore((state: any) => state.projects);

  const [remoteProjects, setRemoteProjects] = useState<Project[]>([]);
  const [hasRequested, setHasRequested] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(deviceType === 'mobile');

  const isMobile = deviceType === 'mobile';

  // Desktop : répondre aux demandes de projets
  useEffect(() => {
    if (!isMobile) {
      const unsubscribe = onProjectsDataRequested(() => {
        const projectsJson = JSON.stringify(localProjects);
        broadcastProjects(projectsJson);
      });

      return unsubscribe;
    }
  }, [isMobile, localProjects, broadcastProjects, onProjectsDataRequested]);

  // Mobile : recevoir les projets
  useEffect(() => {
    if (isMobile) {
      const unsubscribe = onReceiveProjects((projectsJson: string) => {
        try {
          const projects = JSON.parse(projectsJson);
          setRemoteProjects(projects);
          setIsLoadingRemote(false);
        } catch (err) {
          console.error('Parse error:', err);
          setIsLoadingRemote(false);
        }
      });

      return unsubscribe;
    } else {
      setIsLoadingRemote(false);
    }
  }, [isMobile, onReceiveProjects]);

  // Mobile : demander les projets une fois connecté
  useEffect(() => {
    if (isMobile && isConnected && !hasRequested) {
      const timer = setTimeout(() => {
        requestProjectsData();
        setHasRequested(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isMobile, isConnected, hasRequested, requestProjectsData]);

  return {
    projects: isMobile ? remoteProjects : localProjects,
    isMobile,
    isConnected,
    isLoadingRemote,
  };
};
