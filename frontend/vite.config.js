import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load .env files AND shell env vars (Render sets VITE_API_URL as a shell var)
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL || '';

  return {
    plugins: [react()],
    define: {
      // Explicitly bake the value into the bundle so it's never undefined
      '__VITE_API_URL__': JSON.stringify(apiUrl),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
