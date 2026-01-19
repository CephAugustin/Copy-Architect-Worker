import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically target process.env.API_KEY for replacement.
    // This ensures it is available in the browser context as required by the coding guidelines.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Also provide a fallback for process.env to prevent "process is not defined" errors.
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  },
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});