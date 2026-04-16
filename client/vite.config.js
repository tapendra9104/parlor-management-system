import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Safari 14+ / iOS 14+ / Chrome 87+ / Firefox 78+ / Edge 88+
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          icons: ['react-icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Cross-browser CSS support
  css: {
    devSourcemap: true,
  },
});
