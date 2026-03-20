#!/bin/bash

# Script pour créer une icône macOS (.icns) depuis un SVG

echo "🎨 Conversion du logo en icône macOS..."

# Créer un dossier temporaire pour les tailles d'icônes
mkdir -p icon.iconset

# Convertir le SVG en PNG à différentes tailles (nécessite Inkscape ou ImageMagick)
# Si vous avez Homebrew : brew install imagemagick

# Utilisation de sips (intégré à macOS) pour les conversions
# D'abord, convertir le SVG en PNG 1024x1024 (nécessite un PNG source)

if command -v magick &> /dev/null; then
    echo "✅ ImageMagick trouvé, conversion en cours..."
    
    # Convertir SVG en PNG haute résolution
    magick -background none -density 1024 ../public/film.svg -resize 1024x1024 temp_1024.png
    
    # Créer toutes les tailles requises
    sips -z 16 16     temp_1024.png --out icon.iconset/icon_16x16.png
    sips -z 32 32     temp_1024.png --out icon.iconset/icon_16x16@2x.png
    sips -z 32 32     temp_1024.png --out icon.iconset/icon_32x32.png
    sips -z 64 64     temp_1024.png --out icon.iconset/icon_32x32@2x.png
    sips -z 128 128   temp_1024.png --out icon.iconset/icon_128x128.png
    sips -z 256 256   temp_1024.png --out icon.iconset/icon_128x128@2x.png
    sips -z 256 256   temp_1024.png --out icon.iconset/icon_256x256.png
    sips -z 512 512   temp_1024.png --out icon.iconset/icon_256x256@2x.png
    sips -z 512 512   temp_1024.png --out icon.iconset/icon_512x512.png
    sips -z 1024 1024 temp_1024.png --out icon.iconset/icon_512x512@2x.png
    
    # Créer le fichier .icns
    iconutil -c icns icon.iconset -o icon.icns
    
    # Nettoyer
    rm -rf icon.iconset temp_1024.png
    
    echo "✅ Icône créée : build/icon.icns"
    echo "📝 Ajoutez 'icon: \"build/icon.icns\"' dans le champ 'mac' de package.json"
else
    echo "❌ ImageMagick non trouvé"
    echo "📥 Installez-le avec : brew install imagemagick"
    echo ""
    echo "Alternative : Utilisez un convertisseur en ligne :"
    echo "  1. Allez sur https://cloudconvert.com/svg-to-icns"
    echo "  2. Uploadez public/film.svg"
    echo "  3. Téléchargez icon.icns"
    echo "  4. Placez-le dans build/icon.icns"
fi
