import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/n2yo': {
        target: 'https://api.n2yo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n2yo/, '/rest/v1/satellite'),
        secure: true,
      },
    },
  },
})
