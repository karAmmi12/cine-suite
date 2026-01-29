/**
 * 🎯 USAGE TRACKING INTÉGRÉ
 * Hook pour tracker les actions utilisateur
 */

import { useEffect } from 'react';
import { Telemetry } from '../security/telemetry';

// Hook pour tracker automatiquement le montage des pages
export function usePageView(pageName: string) {
  useEffect(() => {
    Telemetry.track('page_view', { page: pageName });
  }, [pageName]);
}

// Hook pour tracker les erreurs React
export function useErrorTracking() {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      Telemetry.trackError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);
}

// Export des fonctions de tracking communes
export const tracking = {
  sceneCreated: (type: string) => Telemetry.trackSceneCreated(type),
  scenePlayed: (sceneId: string, duration: number) => Telemetry.trackScenePlayed(sceneId, duration),
  aiGeneration: (type: string, success: boolean) => Telemetry.trackAIGeneration(type, success),
  export: (format: string, hasWatermark: boolean) => Telemetry.trackExport(format, hasWatermark),
  buttonClick: (buttonName: string) => Telemetry.track('button_click', { button: buttonName }),
  featureUsed: (feature: string) => Telemetry.track('feature_used', { feature })
};
