import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(() => {
  const useHttpsProxy = process.env.VITE_USE_HTTPS_PROXY === 'true';

  return {
    plugins: [react(), jsconfigPaths()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true,
      // Only pin HMR to port 443 when running behind an HTTPS reverse proxy/tunnel.
      // For plain local dev, let Vite use its default HMR client port.
      hmr: useHttpsProxy ? { clientPort: 443 } : true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 3500,
      rollupOptions: {
        output: { manualChunks: {} },
        plugins: [],
      },
    },
  };
});