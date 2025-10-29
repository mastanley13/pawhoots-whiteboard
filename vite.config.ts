import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.BOARDING_PROXY_TARGET || 'http://localhost:8787';
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/boarding': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
}) 
