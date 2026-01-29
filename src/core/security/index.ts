/**
 * 🔐 SECURITY MODULE
 * Point d'entrée pour toutes les fonctionnalités de sécurité
 */

export { DeviceFingerprint } from './fingerprint';
export { AntiDebug } from './antiDebug';
export { Encryption } from './encryption';
export { Telemetry } from './telemetry';

// Initialisation centralisée
export async function initializeSecurity() {
  if (import.meta.env.DEV) {
    console.log('🔐 Security module loaded (dev mode)');
    return;
  }

  try {
    // 1. Anti-debug & anti-tampering
    const { AntiDebug } = await import('./antiDebug');
    AntiDebug.initialize();

    // 2. Telemetry
    const { Telemetry } = await import('./telemetry');
    await Telemetry.initialize();

    // 3. Device fingerprint
    const { DeviceFingerprint } = await import('./fingerprint');
    const deviceId = await DeviceFingerprint.generate();
    
    console.log('🔐 Security initialized:', deviceId.substring(0, 8) + '...');
  } catch (error) {
    console.error('Security initialization failed:', error);
  }
}
