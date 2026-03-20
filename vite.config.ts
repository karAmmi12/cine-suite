import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Utiliser des chemins relatifs pour Electron
  server: {
    host: '0.0.0.0', // Écouter sur toutes les interfaces réseau
    port: 5173,
  },
})
