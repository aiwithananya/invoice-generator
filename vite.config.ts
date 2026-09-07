import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// 100% client-side app — Vite builds a fully static bundle that can be
// hosted on any static host (GitHub Pages, Netlify, Vercel, etc.). No server.
//
// GitHub Pages project sites serve from https://<user>.github.io/<repo>/, so the
// build needs `base` set to that sub-path. The deploy workflow passes it as
// BASE_PATH; hosts that serve from the domain root (Vercel, Netlify, a user/org
// GitHub Pages site) need nothing — base defaults to '/'.
//
// The PWA plugin adds a service worker that precaches the whole app shell, so
// once the page has loaded it works fully offline and can be installed. The
// service worker only caches our own static assets — it never sends data out.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Precache the built app shell for offline use. No runtime network
        // caching is configured because the app makes no network requests.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      manifest: {
        name: 'AI with Ananya · Invoice Generator',
        short_name: 'Invoice Gen',
        description:
          'Free, private, browser-only GST invoice generator for Indian businesses. Your data never leaves your device.',
        theme_color: '#4f46e5',
        background_color: '#f1f5f9',
        display: 'standalone',
        // Relative so the manifest resolves correctly whether the app is served
        // from the domain root or a GitHub Pages /<repo>/ sub-path.
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
