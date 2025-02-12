import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    exclude: ['@supabase/supabase-js'],
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  },
  server: {
    hmr: {
      port: 5173,
      protocol: 'ws',
      host: 'localhost',
      timeout: 30000,
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000
    },
    host: true,
    port: 5173,
    strictPort: false,
    cors: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'icons-vendor': ['lucide-react']
        },
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
});