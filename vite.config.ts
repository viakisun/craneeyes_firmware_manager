import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  },
  // AWS SDK 브라우저 호환성을 위한 설정
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', '@aws-sdk/fetch-http-handler'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'aws-sdk': ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', '@aws-sdk/fetch-http-handler'],
        },
      },
    },
  },
})
