/**
 * 🛡️ ANTI-DEBUG & ANTI-TAMPERING
 * Détecte et bloque les tentatives de reverse engineering
 */

export class AntiDebug {
  private static isDebuggerDetected = false;
  private static checksumCache = new Map<string, string>();

  static initialize() {
    if (import.meta.env.DEV) return; // Désactivé en dev

    // Détection DevTools
    this.detectDevTools();
    
    // Détection debugger
    this.detectDebugger();
    
    // Vérification intégrité code
    this.verifyIntegrity();
    
    // Protection console
    this.protectConsole();
    
    // Détection timing attacks
    this.detectTimingAttacks();
  }

  private static detectDevTools() {
    const threshold = 160;
    const devtools = /./;
    
    devtools.toString = function() {
      AntiDebug.handleTampering('DevTools détecté');
      return 'DevTools';
    };

    // Check taille fenêtre (DevTools ouverts)
    const checkSize = () => {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        this.handleTampering('Fenêtre suspecte détectée');
      }
    };

    setInterval(checkSize, 1000);
    console.log('%c', devtools);
  }

  private static detectDebugger() {
    setInterval(() => {
      const before = performance.now();
      debugger; // eslint-disable-line no-debugger
      const after = performance.now();
      
      if (after - before > 100) {
        this.isDebuggerDetected = true;
        this.handleTampering('Debugger détecté');
      }
    }, 3000);
  }

  private static verifyIntegrity() {
    // Vérifie que les fonctions critiques n'ont pas été modifiées
    const criticalFunctions = [
      'localStorage.getItem',
      'localStorage.setItem',
      'fetch',
      'XMLHttpRequest.prototype.open'
    ];

    criticalFunctions.forEach(funcName => {
      try {
        const parts = funcName.split('.');
        let obj: any = window;
        
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        
        const func = obj[parts[parts.length - 1]];
        const code = func.toString();
        const hash = this.simpleHash(code);
        
        // Stocke le hash initial
        if (!this.checksumCache.has(funcName)) {
          this.checksumCache.set(funcName, hash);
        } else {
          // Vérifie si modifié
          if (this.checksumCache.get(funcName) !== hash) {
            this.handleTampering(`Fonction ${funcName} modifiée`);
          }
        }
      } catch {}
    });
  }

  private static protectConsole() {
    // Empêche l'accès facile aux variables globales
    const noop = () => {};
    
    if (import.meta.env.PROD) {
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      console.warn = noop;
      
      // Message piège pour les curieux
      console.error('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
      console.error('%cCette fonctionnalité est réservée aux développeurs.', 'font-size: 16px;');
      console.error('%cL\'utilisation de cette console pour copier/coller du code peut permettre à des attaquants de voler vos données.', 'font-size: 14px; color: orange;');
    }
  }

  private static detectTimingAttacks() {
    // Détecte si quelqu'un mesure les performances pour reverse engineering
    let lastTime = performance.now();
    
    setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      
      // Si le delta est trop court, quelqu'un mesure peut-être le code
      if (delta < 10) {
        this.handleTampering('Timing attack détecté');
      }
      
      lastTime = now;
    }, 100);
  }

  private static handleTampering(reason: string) {
    if (import.meta.env.DEV) return;

    // Log pour analytics (ne pas afficher à l'utilisateur)
    this.reportSecurityEvent('tampering_detected', { reason });

    // Perturbation subtile de l'application
    setTimeout(() => {
      // Ajoute du bruit dans les calculs
      Math.random = () => 0.5;
      
      // Ralentit légèrement l'app
      const slowDown = () => {
        const start = Date.now();
        while (Date.now() - start < 10) {}
      };
      
      setInterval(slowDown, 1000);
    }, 5000);
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private static reportSecurityEvent(event: string, data: any) {
    // Envoie à votre backend (ne pas bloquer l'app)
    if ('sendBeacon' in navigator) {
      const payload = JSON.stringify({ event, data, timestamp: Date.now() });
      navigator.sendBeacon('/api/security/report', payload);
    }
  }

  static isCompromised(): boolean {
    return this.isDebuggerDetected;
  }
}
