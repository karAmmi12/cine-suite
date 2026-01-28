/**
 * 📡 OFFLINE CONTROLLER - Autonomie totale sans connexion
 * Convertit automatiquement les assets en Base64
 */

/**
 * Détecte toutes les URLs d'images dans un objet
 */
const findImageUrls = (obj: any, urls: Set<string> = new Set()): Set<string> => {
  if (typeof obj !== 'object' || obj === null) return urls;
  
  for (const key in obj) {
    const value = obj[key];
    
    // Détection d'URLs d'images
    if (typeof value === 'string') {
      if (value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        urls.add(value);
      }
      // Détection de chemins locaux
      if (value.match(/^\/images\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        urls.add(value);
      }
    }
    
    // Récursion pour les objets et tableaux
    if (typeof value === 'object') {
      findImageUrls(value, urls);
    }
  }
  
  return urls;
};

/**
 * Télécharge et convertit une image en Base64
 */
const downloadAndConvert = async (url: string): Promise<string> => {
  try {
    // Si c'est déjà en Base64, on retourne tel quel
    if (url.startsWith('data:image')) {
      return url;
    }
    
    // Téléchargement de l'image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert to Base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to convert ${url}:`, error);
    return url; // Retourne l'URL originale en cas d'échec
  }
};

/**
 * Remplace les URLs par leur version Base64 dans un objet
 */
const replaceUrls = (obj: any, mapping: Map<string, string>): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => replaceUrls(item, mapping));
  }
  
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string' && mapping.has(value)) {
      result[key] = mapping.get(value);
    } else if (typeof value === 'object') {
      result[key] = replaceUrls(value, mapping);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Convertit automatiquement toutes les images d'une configuration en Base64
 */
export const convertToOffline = async <T extends object>(
  config: T,
  onProgress?: (current: number, total: number, url: string) => void
): Promise<T> => {
  try {
    // 1. Trouver toutes les URLs d'images
    const urls = findImageUrls(config);
    
    if (urls.size === 0) {
      console.log('✅ No images to convert');
      return config;
    }
    
    console.log(`🔄 Converting ${urls.size} images to Base64...`);
    
    // 2. Télécharger et convertir chaque image
    const mapping = new Map<string, string>();
    let current = 0;
    
    for (const url of urls) {
      current++;
      onProgress?.(current, urls.size, url);
      
      const base64 = await downloadAndConvert(url);
      mapping.set(url, base64);
      
      console.log(`  [${current}/${urls.size}] ${url.substring(0, 50)}...`);
    }
    
    // 3. Remplacer les URLs dans l'objet
    const offlineConfig = replaceUrls(config, mapping);
    
    console.log(`✅ All images converted to Base64 (${urls.size} images)`);
    return offlineConfig;
    
  } catch (error) {
    console.error('❌ Offline conversion failed:', error);
    throw error;
  }
};

/**
 * Vérifie si une configuration est 100% offline
 */
export const isFullyOffline = (config: any): boolean => {
  const urls = findImageUrls(config);
  
  for (const url of urls) {
    // Si on trouve une URL externe, ce n'est pas offline
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return false;
    }
    // Si c'est un chemin local mais pas en Base64, ce n'est pas offline
    if (url.startsWith('/images/') && !url.startsWith('data:image')) {
      return false;
    }
  }
  
  return true;
};

/**
 * Statistiques sur les assets
 */
export const getAssetStats = (config: any): {
  total: number;
  base64: number;
  urls: number;
  localPaths: number;
} => {
  const urls = findImageUrls(config);
  
  let base64 = 0;
  let externalUrls = 0;
  let localPaths = 0;
  
  for (const url of urls) {
    if (url.startsWith('data:image')) {
      base64++;
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      externalUrls++;
    } else {
      localPaths++;
    }
  }
  
  return {
    total: urls.size,
    base64,
    urls: externalUrls,
    localPaths,
  };
};

/**
 * Précharge les images locales pour un accès instantané
 */
export const preloadLocalImages = async (paths: string[]): Promise<void> => {
  const promises = paths.map(async (path) => {
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = path;
      });
      console.log(`✅ Preloaded: ${path}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload: ${path}`);
    }
  });
  
  await Promise.all(promises);
  console.log(`✅ Preloaded ${paths.length} images`);
};

/**
 * Estime la taille mémoire d'une configuration
 */
export const estimateSize = (config: any): string => {
  const json = JSON.stringify(config);
  const bytes = new Blob([json]).size;
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
