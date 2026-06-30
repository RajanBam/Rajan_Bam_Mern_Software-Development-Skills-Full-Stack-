import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API + Socket.IO server runs on :5000 during development.
// Proxying keeps the front-end talking to same-origin "/api" and "/socket.io".
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true },
    },
  },
});
