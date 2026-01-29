# 🔐 SÉCURITÉ CINESUITE

## Vue d'ensemble

CineSuite intègre plusieurs couches de sécurité pour protéger le code source, les données utilisateurs et détecter les usages suspects.

## Modules de sécurité

### 1. **Device Fingerprinting** (`fingerprint.ts`)
Génère une empreinte unique par appareil basée sur :
- Canvas fingerprinting
- WebGL fingerprinting
- Audio context fingerprinting
- Métadonnées navigateur

**Usage:**
```typescript
import { DeviceFingerprint } from '@/core/security';
const deviceId = await DeviceFingerprint.generate();
```

### 2. **Anti-Debug & Anti-Tampering** (`antiDebug.ts`)
Protège contre le reverse engineering :
- Détection DevTools ouvertes
- Détection debugger actif
- Vérification intégrité des fonctions critiques
- Protection console
- Détection timing attacks

**Comportement:**
- En production : Active toutes les protections
- En développement : Désactivé
- Si compromis : Perturbation subtile de l'app (pas de crash brutal)

### 3. **Encryption** (`encryption.ts`)
Chiffre les données sensibles :
- AES-GCM 256 bits
- Chiffrement automatique localStorage en production
- Hash SHA-256 pour vérification intégrité

**Usage:**
```typescript
import { Encryption } from '@/core/security';
const encrypted = await Encryption.encrypt('data');
const decrypted = await Encryption.decrypt(encrypted);
```

### 4. **Telemetry** (`telemetry.ts`)
Track l'usage et détecte les comportements suspects :
- Events utilisateur
- Activités suspectes (DevTools, copie excessive, clics rapides)
- Performance monitoring
- Error tracking

**Events trackés:**
- `session_start`
- `scene_created`
- `scene_played`
- `ai_generation`
- `export`
- `suspicious_activity`

## Intégration dans l'app

### Initialisation (main.tsx)
```typescript
import { initializeSecurity } from './core/security';
initializeSecurity();
```

### Store chiffré (projectStore.ts)
Le store Zustand utilise automatiquement le chiffrement en production :
```typescript
storage: createJSONStorage(() => ({
  getItem: async (name) => {
    // Déchiffre automatiquement
  },
  setItem: async (name, value) => {
    // Chiffre automatiquement
  }
}))
```

### Tracking dans les composants
```typescript
import { tracking } from '@/core/hooks/useTracking';

// Dans un composant
tracking.sceneCreated('search');
tracking.buttonClick('export_video');
tracking.aiGeneration('chat', true);
```

## Build sécurisé

### Build normal
```bash
npm run build
```

### Build avec obfuscation
```bash
npm run build:secure
```

L'obfuscation applique :
- Compaction du code
- Control flow flattening (rend illisible)
- Dead code injection (leurres)
- String array encoding
- Self-defending (crash si manipulé)
- Debug protection

## Configuration recommandée en production

1. **Variables d'environnement**
```env
VITE_API_URL=https://api.cinesuite.com
VITE_TELEMETRY_ENDPOINT=/api/telemetry
VITE_SECURITY_SALT=votre_salt_unique_ici
```

2. **Backend endpoints requis**
- `POST /api/telemetry` - Réception des events
- `POST /api/security/report` - Alertes de sécurité

3. **Monitoring**
- Surveiller les `suspicious_activity` events
- Alerter si :
  - Même deviceId avec plusieurs IPs
  - Taux d'erreurs anormal
  - DevTools détectées répétitivement

## Niveaux de protection

| Feature | Dev | Production |
|---------|-----|------------|
| Anti-Debug | ❌ | ✅ |
| Telemetry | ✅ (console only) | ✅ (serveur) |
| Encryption | ❌ | ✅ |
| Obfuscation | ❌ | ✅ (build:secure) |
| Fingerprinting | ✅ | ✅ |

## Désactivation temporaire

Si besoin de débugger en production :
```typescript
// Dans security/index.ts
export async function initializeSecurity() {
  // Commenter l'initialisation
  return; 
}
```

## Prochaines étapes de sécurité

1. **Backend authentication** - Validation licenses côté serveur
2. **Rate limiting** - Protection API abuse
3. **Code signing** - Vérifier intégrité des builds
4. **Watermark dynamique** - Par utilisateur (traçabilité)
5. **DRM vidéo** - Protection exports vidéo

## Avertissements

⚠️ **Ces protections ne sont pas infaillibles** mais augmentent considérablement le coût d'attaque.

⚠️ **L'obfuscation ralentit légèrement l'app** (~10-15% en bundle size, ~5% en runtime).

⚠️ **Toujours tester le build obfusqué** avant déploiement.

## Support

Pour toute question de sécurité, contactez : security@cinesuite.com
