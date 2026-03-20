import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://finalchat-7zx7.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
