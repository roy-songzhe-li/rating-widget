import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://nodejs-serverless-function-express-opal-omega.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        widget: 'src/rating-widget/index.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'widget' ? 'rating-widget.js' : '[name]-[hash].js';
        }
      }
    }
  }
})
