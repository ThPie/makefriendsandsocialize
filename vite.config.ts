import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    BUILD_TIMESTAMP: JSON.stringify(new Date().toISOString()),
    APP_VERSION: JSON.stringify('1.0.0'),
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 600,
    // Ensure assets use relative paths for Capacitor
    assetsDir: 'assets',
    // Only generate sourcemaps in development
    sourcemap: mode === 'development',
    // Enable esbuild minification
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        // Fine-grained manual chunk splitting to reduce initial bundle size
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          // React core — keep tiny
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-core';
          // Router
          if (id.includes('react-router')) return 'router';
          // Supabase
          if (id.includes('@supabase/')) return 'supabase';
          // TanStack Query
          if (id.includes('@tanstack/')) return 'query';
          // Radix UI
          if (id.includes('@radix-ui/')) return 'radix-ui';
          // Recharts (heavy, admin-only)
          if (id.includes('recharts') || id.includes('d3-') || id.includes('d3/')) return 'charts';
          // Framer Motion
          if (id.includes('framer-motion')) return 'framer';
          // Lucide icons
          if (id.includes('lucide-react')) return 'icons';
          // Sentry — keep out of critical path
          if (id.includes('@sentry/')) return 'sentry';
          // AI SDK — only used in dating intake
          if (id.includes('/ai/') || id.includes('@ai-sdk/')) return 'ai-sdk';
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform/') || id.includes('/zod/')) return 'forms';
          // Date utilities
          if (id.includes('date-fns') || id.includes('react-day-picker')) return 'dates';
          // DnD Kit
          if (id.includes('@dnd-kit/')) return 'dnd';
          // ElevenLabs (voice, rarely used)
          if (id.includes('@elevenlabs/')) return 'elevenlabs';
          // Capacitor (native app only)
          if (id.includes('@capacitor/')) return 'capacitor';
        },
      },
    },
  },
  // Base path for Capacitor (relative paths for native app compatibility)
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        // Cache strategies for better repeat-visit performance
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'MakeFriends Social Club',
        short_name: 'MakeFriends',
        description: 'Private social club for professionals seeking genuine friendships and meaningful connections.',
        theme_color: '#052e16',
        background_color: '#052e16',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['social', 'lifestyle'],
        shortcuts: [
          {
            name: 'Events',
            short_name: 'Events',
            url: '/events',
            description: 'Browse upcoming curated events',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'My Dashboard',
            short_name: 'Dashboard',
            url: '/portal',
            description: 'View your member dashboard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
