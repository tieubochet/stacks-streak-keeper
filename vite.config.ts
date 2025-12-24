import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Bắt buộc: Cho phép import kiểu 'node:events', 'node:util'
      protocolImports: true,
      // Bật toàn bộ polyfill
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Đảm bảo các module core của Node được map đúng
      events: 'events',
      util: 'util',
    },
  },
  // Định nghĩa cứng biến global để tránh lỗi runtime
  define: {
    'global': 'window',
    'process.env': {}, 
  },
})