import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import manifestFirefox from './manifest.firefox.json';
import { resolve } from 'path';

const browser = process.env.BROWSER || 'chrome';

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: browser === 'firefox' ? manifestFirefox : manifest,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: browser === 'firefox' ? 'dist-firefox' : 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        devtools: resolve(__dirname, 'src/devtools/devtools.html'),
        panel: resolve(__dirname, 'src/devtools/panel.html'),
      },
    },
  },
});
