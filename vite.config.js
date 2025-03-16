import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// Check if building widget
const isWidget = process.env.BUILD_TARGET === 'widget';

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
      // Choose entry point based on build target
      input: isWidget 
        ? 'src/rating-widget/index.js'
        : {
            main: 'index.html',
          },
      output: {
        entryFileNames: isWidget 
          ? 'rating-widget.js' 
          : '[name]-[hash].js',
        format: isWidget ? 'iife' : undefined,
      }
    },
    // Ensure generated code runs in any environment
    target: 'es2015',
    // Minimize code size
    minify: true,
    // Generate sourcemap for debugging
    sourcemap: true
  }
})
