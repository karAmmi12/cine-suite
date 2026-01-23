import type { SceneDefinition } from '../types/schema';

// Fonction pour télécharger la scène actuelle en fichier .json
export const downloadSceneConfig = (scene: SceneDefinition) => {
  // 1. Convertir l'objet JS en texte JSON
  const dataStr = JSON.stringify(scene, null, 2);
  
  // 2. Créer un "Blob" (un fichier virtuel en mémoire)
  const blob = new Blob([dataStr], { type: 'application/json' });
  
  // 3. Créer un lien de téléchargement invisible
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // 4. Générer un nom de fichier propre (ex: cine-scene-bureau-des-legendes.json)
  const safeName = scene.meta.sceneName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `cine-scene-${safeName}.json`;
  
  // 5. Simuler le clic
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Fonction pour lire un fichier uploadé par l'utilisateur
export const readJsonFile = (file: File): Promise<SceneDefinition> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Ici, dans un vrai projet pro, on utiliserait Zod pour valider que le JSON est correct
        // Pour l'instant on vérifie juste qu'il a un "module"
        if (!json.module) throw new Error("Format de scène invalide");
        
        resolve(json as SceneDefinition);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// Fonction pour convertir une image en chaîne Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Vérification de taille (Max 2MB pour ne pas faire laguer le navigateur)
    if (file.size > 2 * 1024 * 1024) {
      reject("L'image est trop lourde (Max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};