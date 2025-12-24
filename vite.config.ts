import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'events', 'string_decoder', 'http', 'https', 'url', 'zlib', 'punycode'],
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
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'buffer',
    },
  },
  define: {
    'global': 'globalThis', // Quan trọng: thay đổi từ 'window' sang 'globalThis'
  },
  build: {
    rollupOptions: {
      plugins: [
        // Ép buộc Rollup đưa các polyfill này vào bundle
        nodePolyfills(), 
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true, // Quan trọng cho các thư viện CJS/ESM lẫn lộn
    },
  },
})