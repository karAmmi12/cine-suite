/**
 * 🔐 Configuration des endpoints de sécurité
 */

// Mode développement : logs en console seulement
const isDev = import.meta.env.DEV;

// URLs des endpoints (à configurer)
export const TELEMETRY_URL = import.meta.env.VITE_TELEMETRY_URL || '/api/telemetry';
export const SECURITY_URL = import.meta.env.VITE_SECURITY_URL || '/api/security/report';

// Supabase config (optionnel)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper pour logger en dev
export function devLog(category: string, message: string, data?: any) {
  if (isDev) {
    console.log(`[${category}]`, message, data || '');
  }
}

// Helper pour envoyer events (avec fallback si pas de backend)
export async function sendToBackend(url: string, data: any): Promise<boolean> {
  try {
    if (isDev) {
      devLog('Backend', `Would send to ${url}:`, data);
      return true;
    }

    // Essai avec sendBeacon (préféré)
    if ('sendBeacon' in navigator) {
      const sent = navigator.sendBeacon(url, JSON.stringify(data));
      if (sent) return true;
    }

    // Fallback : fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    });

    return response.ok;
  } catch (error) {
    console.warn(`Failed to send to ${url}:`, error);
    return false;
  }
}
