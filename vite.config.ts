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
        // 确保外部化处理那些你不想打包进库的依赖
        globals: {
          // 没有外部依赖
        }
      }
    },
    // 将public目录下的文件复制到dist目录
    copyPublicDir: true,
  },
  preview: {
    // 设置预览服务器的默认页面
    open: '/test.html'
  }
})
