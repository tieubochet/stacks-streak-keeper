import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Bật polyfill cho các module nodejs core
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // Ép buộc chuyển hướng module Node sang Browser
      'ws': 'isomorphic-ws', 
      'stream': 'stream-browserify',
      'util': 'util',
      'process': 'process/browser',
      'buffer': 'buffer',
    },
  },
  define: {
    // Định nghĩa lại global và process.env để tránh crash
    'global': 'globalThis',
    'process.env': {}, 
  },
  build: {
    // Tùy chọn này giúp debug lỗi build nếu có
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})