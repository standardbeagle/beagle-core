import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: '@standardbeagle/virtual-router',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.${( format ==='umd' ? "c" : "")}js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: "./setup-tests.ts",
  },
})
