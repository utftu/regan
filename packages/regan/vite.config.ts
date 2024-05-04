import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // react({jsxImportSource: 'my-jsx'}),
    dts({
      outDir: './dist/types',
      // include: './src/regan.ts',
    }),
    // dts({
    //   outDir: './dist/types1',
    //   include: './jsx.global.ts',
    // }),
  ],
  esbuild: {
    jsx: 'automatic',
    jsxDev: true,
    jsxImportSource: new URL('./jsx-build', import.meta.url).pathname,

    jsxFragment: 'Fragment',
    jsxFactory: 'createElement',
    // jsxInject: `import {jsx, jsxs} from 'my-jsx'`,
  },
  build: {
    outDir: './dist',
    lib: {
      entry: ['./src/regan.ts'],
      formats: ['es'],
    },
  },
  // resolve: {
  //   alias: {
  //     // 'my-jsx': new URL('./jsx-build/jsx-runtime', import.meta.url).pathname,
  //     'my-jsx': new URL('./src/jsx/jsx.ts', import.meta.url).pathname,
  //   },
  // },
});
