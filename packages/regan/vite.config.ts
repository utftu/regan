import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({jsxImportSource: 'my-jsx'}),
    dts({
      outDir: './dist/types',
      // include: './src/regan.ts',
    }),
    dts({
      outDir: './dist/types1',
      include: './jsx.global.ts',
    }),
  ],
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
      'my-jsx': new URL('./src/jsx', import.meta.url).pathname,
    },
  },
});
