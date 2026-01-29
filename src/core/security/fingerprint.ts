/**
 * 🔐 DEVICE FINGERPRINTING
 * Identifie de manière unique chaque installation
 */

export class DeviceFingerprint {
  private static STORAGE_KEY = 'cinesuite_device_id';

  static async generate(): Promise<string> {
    // Vérifie si déjà existant
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (existing) return existing;

    // Collecte des données pour fingerprint
    const canvas = this.getCanvasFingerprint();
    const webgl = this.getWebGLFingerprint();
    const audio = await this.getAudioFingerprint();
    
    const data = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      canvas,
      webgl,
      audio,
      timestamp: Date.now()
    };

    const fingerprint = await this.hashData(JSON.stringify(data));
    localStorage.setItem(this.STORAGE_KEY, fingerprint);
    
    return fingerprint;
  }

  private static getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('CineSuite 🎬', 2, 15);
      
      return canvas.toDataURL().slice(-50);
    } catch {
      return '';
    }
  }

  private static getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (!gl) return '';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      return `${vendor}|${renderer}`.slice(0, 50);
    } catch {
      return '';
    }
  }

  private static async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chrome bloque AudioContext sans interaction utilisateur
      if (audioContext.state === 'suspended') {
        await audioContext.close();
        return 'audio_suspended';
      }
      
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);

      return new Promise((resolve) => {
        let completed = false;
        
        // Timeout si pas de réponse en 100ms
        setTimeout(() => {
          if (!completed) {
            completed = true;
            try {
              oscillator.stop();
              scriptProcessor.disconnect();
              audioContext.close();
            } catch {}
            resolve('audio_timeout');
          }
        }, 100);
        
        scriptProcessor.onaudioprocess = (event) => {
          if (completed) return;
          completed = true;
          
          const output = event.inputBuffer.getChannelData(0);
          const sum = output.reduce((a, b) => a + Math.abs(b), 0);
          
          try {
            oscillator.stop();
            scriptProcessor.disconnect();
            audioContext.close();
          } catch {}
          
          resolve(sum.toString().slice(0, 20));
        };
      });
    } catch (error) {
      console.warn('Audio fingerprint skipped:', error);
      return 'audio_error';
    }
  }

  private static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
