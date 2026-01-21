import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3005,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
