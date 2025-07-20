import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/movies': {
        target: 'https://kikoky.shop',
        changeOrigin: true,
        secure: false,
      },
      '/dj': {
        target: 'https://kikoky.shop',
        changeOrigin: true,
        secure: false,
      },
      '/comment': {
        target: 'https://kikoky.shop',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})