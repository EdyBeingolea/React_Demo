import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      },
      rollupOptions: {
        output: {
          manualChunks: isProduction ? undefined : null,
        }
      }
    },
  };
});
