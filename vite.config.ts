import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true, // Cho phép import 'node:...'
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Ép buộc dùng bản browser cho các thư viện Node
      'ws': 'isomorphic-ws', 
      'stream': 'stream-browserify',
      'util': 'util',
    },
  },
  define: {
    // Định nghĩa biến toàn cục để tránh lỗi runtime
    'global': 'window',
    'process.env': {}, 
  },
  build: {
    // Tăng giới hạn cảnh báo chunk size (không ảnh hưởng lỗi, chỉ cho sạch log)
    chunkSizeWarningLimit: 1600,
  }
})