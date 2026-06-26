// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load all env vars ('' prefix = include non-VITE_ vars too)
  const env = loadEnv(mode, process.cwd(), '')

  console.log('[Vite] BACKEND_URL:', env.BACKEND_URL)

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL || 'https://split-app-back-end.onrender.com'),
    },
    server: {
      host: true,
      port: 3000,
      open: true,
      proxy: {
        "/api": {
          target: env.BACKEND_URL || 'https://split-app-back-end.onrender.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
