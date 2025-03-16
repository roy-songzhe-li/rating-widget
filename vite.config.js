import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// 检查是否是构建widget
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
      // 根据构建目标选择入口点
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
    // 确保生成的代码可以在任何环境中运行
    target: 'es2015',
    // 最小化代码体积
    minify: true,
    // 生成sourcemap以便调试
    sourcemap: true
  }
})
