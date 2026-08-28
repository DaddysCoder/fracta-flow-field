import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to `wrangler dev` (see `npm run worker:dev`) so the
    // frontend and Worker can run side by side in local development.
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
