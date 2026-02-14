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
      entry: {
        index: path.resolve(__dirname, 'src/index.tsx'),
        'connectors/react-router': path.resolve(__dirname, 'src/connectors/react-router.tsx'),
        'connectors/nextjs': path.resolve(__dirname, 'src/connectors/nextjs.tsx'),
        'connectors/tanstack': path.resolve(__dirname, 'src/connectors/tanstack.tsx'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        'next/navigation',
        '@tanstack/react-router',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          'next/navigation': 'NextNavigation',
          '@tanstack/react-router': 'TanStackRouter',
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: "./setup-tests.ts",
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'setup-tests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'dist/**',
      ],
    },
  },
})
