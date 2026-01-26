import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ou directement '92.168.88.105'
    port: 5173, // tu peux changer si besoin
  },
});
