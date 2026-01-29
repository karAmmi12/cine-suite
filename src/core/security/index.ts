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
  // Toujours activer en production (import.meta.env.PROD)
  const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
  
  if (!isProduction) {
    console.log('🔓 Security disabled in development');
    return;
  }

  try {
    console.log('🔐 Initializing security...');
    
    // 1. Device fingerprint (priorité - doit être immédiat)
    const { DeviceFingerprint } = await import('./fingerprint');
    const deviceId = await DeviceFingerprint.generate();
    console.log('✅ Device ID:', deviceId.substring(0, 16) + '...');

    // 2. Anti-debug & anti-tampering
    const { AntiDebug } = await import('./antiDebug');
    AntiDebug.initialize();
    console.log('✅ Anti-debug initialized');

    // 3. Telemetry
    const { Telemetry } = await import('./telemetry');
    await Telemetry.initialize();
    console.log('✅ Telemetry initialized');
    
    console.log('🔐 Security fully initialized');
  } catch (error) {
    console.error('❌ Security initialization failed:', error);
  }
}
