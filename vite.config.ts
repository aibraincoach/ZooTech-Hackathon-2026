import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Worker uses dynamic import('kokoro-js') → code-splitting; IIFE not supported (Rollup). worker.format: 'es' required.
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.onnx', '**/*.wasm'],
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@huggingface/transformers'],
  },
  worker: { format: 'es' },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      // Voice models: same-origin so no CORS (worker fetches from 5173, Vite forwards to 8080).
      '/voice-models': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/voice-models/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
