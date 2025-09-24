import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, '.', '')

  return {
    // 👇 Needed for GitHub Pages (replace with your repo name if different)
    base: '/storyboard-ai/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    // 👇 Makes env vars available inside app (local dev)
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
