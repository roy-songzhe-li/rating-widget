import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs-extra'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      }
    }),
    // 自定义插件，在构建后复制 index.html 到 dist 目录
    {
      name: 'copy-index-html',
      closeBundle: async () => {
        try {
          await fs.copy(
            path.resolve(__dirname, 'index.html'),
            path.resolve(__dirname, 'dist/index.html')
          );
          console.log('Successfully copied index.html to dist directory');
        } catch (err) {
          console.error('Error copying index.html:', err);
        }
      }
    }
  ],
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
    open: '/index.html'
  }
})
