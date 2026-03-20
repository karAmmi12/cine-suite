#!/bin/bash
# Script de démarrage complet pour CineSuite Desktop

echo "🚀 Démarrage de CineSuite Desktop..."

# Nettoyer les processus existants
echo "🧹 Nettoyage des processus existants..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
pkill -9 -f "dotnet run" 2>/dev/null
pkill -9 -f "electron" 2>/dev/null
sleep 2

# Démarrer le backend .NET
echo "🟢 Démarrage du backend .NET..."
cd "$(dirname "$0")"
dotnet run --project backend/CineSuite.Server.csproj > /tmp/cinesuite-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 4

# Vérifier que le backend tourne
echo "🔍 Vérification du backend..."
if ! curl -s http://localhost:5001/api/network/ip > /dev/null 2>&1; then
    echo "❌ Le backend .NET n'a pas démarré correctement"
    echo "📋 Logs backend:"
    tail -30 /tmp/cinesuite-backend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend démarré et fonctionnel"

# Démarrer Vite
echo "🟦 Démarrage de Vite..."
npm run dev > /tmp/cinesuite-vite.log 2>&1 &
VITE_PID=$!
sleep 3

echo "✅ Vite démarré (PID: $VITE_PID)"

# Démarrer Electron
echo "⚪️ Démarrage d'Electron..."
npm run electron:dev

# Nettoyage à la sortie
echo ""
echo "🛑 Arrêt des processus..."
kill $BACKEND_PID 2>/dev/null
kill $VITE_PID 2>/dev/null
echo "✅ Arrêt complet"
