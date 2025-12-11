import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  // CRITICAL: On Vercel, system environment variables are in process.env.
  // We must check process.env.API_KEY first or fallback to it if env.API_KEY is missing.
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    // Define process.env.API_KEY globally so it can be accessed in the browser
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'recharts', 'lucide-react', '@google/genai'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});