import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({jsxImportSource: 'my-jsx'})],
  // esbuild: {
  //   jsxFactory: 'jsx',
  //   jsxFragment: 'Fragment',
  //   jsxInject: `import {jsx} from 'my-jsx'`,
  // },
  build: {
    outDir: './dist',
    lib: {
      entry: ['./src/regan.ts'],
      formats: ['es'],
    },
  },
  resolve: {
    alias: {
      'my-jsx': new URL('./src/jsx/jsx-runtime', import.meta.url).pathname,
    },
  },
});
