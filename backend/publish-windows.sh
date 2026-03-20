#!/bin/bash
# Script de publication pour Windows x64

echo "🪟 Publication pour Windows x64..."

cd "$(dirname "$0")"

dotnet publish \
  -c Release \
  -r win-x64 \
  --self-contained true \
  /p:PublishSingleFile=true \
  /p:IncludeNativeLibrariesForSelfExtract=true \
  -o ../electron/resources/server/win-x64

echo "✅ Build terminé : ../electron/resources/server/win-x64/CineSuite.Server.exe"
echo "📏 Taille fichier :"
du -h ../electron/resources/server/win-x64/CineSuite.Server.exe

echo "🚀 Prêt à être utilisé avec Electron sur Windows !"
