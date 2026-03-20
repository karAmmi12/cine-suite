#!/bin/bash
# Script de publication pour macOS ARM64 (Apple Silicon)

echo "🍎 Publication pour macOS ARM64 (M4)..."

cd "$(dirname "$0")"

dotnet publish \
  -c Release \
  -r osx-arm64 \
  --self-contained true \
  /p:PublishSingleFile=true \
  /p:IncludeNativeLibrariesForSelfExtract=true \
  -o ../electron/resources/server/osx-arm64

echo "✅ Build terminé : ../electron/resources/server/osx-arm64/CineSuite.Server"
echo "📏 Taille fichier :"
du -h ../electron/resources/server/osx-arm64/CineSuite.Server

# Donner les droits d'exécution automatiquement
chmod +x ../electron/resources/server/osx-arm64/CineSuite.Server

echo "🚀 Prêt à être utilisé avec Electron !"
