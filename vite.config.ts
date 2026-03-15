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
    chunkSizeWarningLimit: 1000,
    // Ensure assets use relative paths for Capacitor
    assetsDir: 'assets',
    // Generate sourcemaps for debugging native issues
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'charts';
            if (id.includes('framer-motion')) return 'framer';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@radix-ui')) return 'ui-libs';
            if (id.includes('@sentry/')) return 'sentry';
            if (id.includes('@supabase/')) return 'supabase';
          }
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
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
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
