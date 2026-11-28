import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // firebase-messaging-sw.js is a separate, hand-written service
      // worker (needed so Firebase Cloud Messaging can receive background
      // pushes). injectManifest mode lets vite-plugin-pwa precache assets
      // while importScripts still loads our Firebase SW logic inside it.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        swDest: 'dist/sw.js',
      },
      manifest: {
        name: 'Class Portal',
        short_name: 'Class Portal',
        description: 'Announcements, materials and updates for the class',
        theme_color: '#111111',
        background_color: '#0b0b0c',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
