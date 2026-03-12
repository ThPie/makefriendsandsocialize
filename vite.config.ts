import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
          }
        },
      },
    },
  },
  // Base path for Capacitor (relative paths for native app compatibility)
  base: './',
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
