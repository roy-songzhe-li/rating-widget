import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte({
    compilerOptions: {
      customElement: true,
    }
  })],
  build: {
    lib: {
      entry: 'src/lib/rating-widget.ts',
      name: 'RatingWidget',
      fileName: 'rating-widget',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        // Ensure to externalize dependencies you don't want to bundle into your library
        globals: {
          // No external dependencies
        }
      }
    },
    // Copy files from public directory to dist directory
    copyPublicDir: true,
  },
  preview: {
    // Set the default page for the preview server
    open: '/test.html'
  }
})
