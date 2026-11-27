import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res: any) => {
              if (res && typeof res.writeHead === 'function' && !res.headersSent) {
                res.writeHead(503, {
                  'Content-Type': 'application/json',
                });
                res.end(
                  JSON.stringify({
                    status: 'OFFLINE',
                    mensaje: 'Backend Spring Boot no disponible en puerto 8080. Modo local resiliente activo.',
                  })
                );
              }
            });
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
