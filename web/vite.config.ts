import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react';
import path from 'path';

const yolo = 'http://localhost:8090';
// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000, // 更改为你想要的端口号
    open: true, // 可选：自动在浏览器中打开
    proxy: {
      '/yolo': {
        target: yolo,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yolo/, '')
      }
    }
  },
  build: {
    // ✅ 1. 生成 source map（生产建议 hidden）
    sourcemap: 'hidden',

    // ✅ 2. 压缩配置（去除 console / debugger）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'] // ✅ 只移除这两个
      },
      format: {
        comments: false // 移除注释
      }
    },
    // ✅ 3. 分包 + 文件命名
    rollupOptions: {
      output: {
        // 文件命名规则
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // 分包策略
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }

            return 'vendor'; // 其他第三方库
          }
        }
      }
    }
  },
  plugins: [
    react(),
    // ✅ 4. gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240 // 10kb以上才压缩
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
