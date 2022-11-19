import { defineConfig } from 'vite';
import { resolve } from 'path';
import { chromeExtension } from 'vite-plugin-chrome-extension';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), (chromeExtension as any)()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: 'src/manifest.json',
    },
  },
});
