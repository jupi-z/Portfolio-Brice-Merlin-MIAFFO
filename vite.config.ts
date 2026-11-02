import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: { sourcemap: false, rollupOptions: { input: 'index.html' } },
  server: { port: 3000, host: '0.0.0.0' }
});
