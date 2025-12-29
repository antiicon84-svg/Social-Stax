import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, '.'),
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
    // host: true, // Commented out to default to localhost and avoid Firebase API Key IP restrictions
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
