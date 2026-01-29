/**
 * 📊 TELEMETRY & USAGE TRACKING
 * Détecte les comportements suspects et track l'usage
 */

import { DeviceFingerprint } from './fingerprint';

interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  deviceId: string;
  sessionId: string;
}

export class Telemetry {
  private static sessionId: string;
  private static deviceId: string;
  private static eventQueue: TelemetryEvent[] = [];
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) return;
    
    this.sessionId = this.generateSessionId();
    this.deviceId = await DeviceFingerprint.generate();
    this.isInitialized = true;

    // Track session start
    this.track('session_start', {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });

    // Flush events periodically
    setInterval(() => this.flush(), 30000); // Toutes les 30s

    // Flush avant fermeture
    window.addEventListener('beforeunload', () => this.flush(true));

    // Track les events suspects
    this.setupSuspiciousActivityDetection();
  }

  static track(event: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    const telemetryEvent: TelemetryEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.pathname,
        env: import.meta.env.MODE
      },
      timestamp: Date.now(),
      deviceId: this.deviceId,
      sessionId: this.sessionId
    };

    this.eventQueue.push(telemetryEvent);

    // Log en dev
    if (import.meta.env.DEV) {
      console.log('📊 Telemetry:', telemetryEvent);
    }

    // Flush si trop d'events
    if (this.eventQueue.length >= 20) {
      this.flush();
    }
  }

  private static async flush(sync = false) {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (sync && 'sendBeacon' in navigator) {
        // Utilise sendBeacon pour garantir l'envoi même si page se ferme
        const payload = JSON.stringify({ events });
        navigator.sendBeacon('/api/telemetry', payload);
      } else {
        // Fetch normal
        await fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events })
        });
      }
    } catch (error) {
      // Remet les events dans la queue en cas d'échec
      this.eventQueue.unshift(...events);
    }
  }

  private static setupSuspiciousActivityDetection() {
    // Détecte copies massives de données
    let copyCount = 0;
    document.addEventListener('copy', () => {
      copyCount++;
      if (copyCount > 10) {
        this.track('suspicious_activity', {
          type: 'excessive_copying',
          count: copyCount
        });
      }
    });

    // Détecte ouverture DevTools
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.track('suspicious_activity', {
          type: 'devtools_opened'
        });
        return '';
      }
    });
    console.log(element);

    // Détecte rapidité anormale (bot?)
    let clickCount = 0;
    let lastClickTime = 0;
    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 100) {
        clickCount++;
        if (clickCount > 5) {
          this.track('suspicious_activity', {
            type: 'rapid_clicking',
            count: clickCount
          });
        }
      } else {
        clickCount = 0;
      }
      lastClickTime = now;
    });

    // Détecte visibilité (utilisateur réel?)
    let hiddenTime = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenTime = Date.now();
      } else {
        const duration = Date.now() - hiddenTime;
        if (duration > 300000) { // 5 minutes
          this.track('suspicious_activity', {
            type: 'long_hidden_duration',
            duration
          });
        }
      }
    });
  }

  private static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Méthodes pour events spécifiques
  static trackSceneCreated(type: string) {
    this.track('scene_created', { type });
  }

  static trackScenePlayed(sceneId: string, duration: number) {
    this.track('scene_played', { sceneId, duration });
  }

  static trackExport(format: string, hasWatermark: boolean) {
    this.track('export', { format, hasWatermark });
  }

  static trackAIGeneration(type: string, success: boolean) {
    this.track('ai_generation', { type, success });
  }

  static trackError(error: Error) {
    this.track('error', {
      message: error.message,
      stack: error.stack?.substring(0, 500) // Limité
    });
  }
}
