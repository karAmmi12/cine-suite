/**
 * Détecte si l'appareil est un mobile via le user-agent.
 * À préférer à la re-détection manuelle dans chaque composant.
 * Pour le deviceType persisté, utiliser `useNetworkStore().deviceType`.
 */
export const isMobileDevice = (): boolean =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
