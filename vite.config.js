// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Use VITE_BASE env var when provided (useful for local/dev override).
// Default: '/spradaglobal/' for GitHub Pages project deploy.
const BASE = process.env.VITE_BASE || (process.env.VITE_API_BASE_URL ? '/' : '/spradaglobal/');

export default defineConfig({
  plugins: [react()],
  base: BASE,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src'),
    }
  }
});
