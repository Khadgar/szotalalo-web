/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/szotalalo-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Szótaláló',
        short_name: 'Szótaláló',
        description: 'Hungarian / English Boggle solver and game',
        lang: 'en',
        scope: '/szotalalo-web/',
        start_url: '/szotalalo-web/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#0d3c61',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        // Don't precache the large dictionaries; cache them on first use.
        globIgnores: ['**/dict_*.txt'],
        runtimeCaching: [
          {
            urlPattern: /\/dict_(hu|en)\.txt$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dictionaries',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
