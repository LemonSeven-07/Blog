import { defineConfig } from 'vite';
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
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
