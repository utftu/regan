// import {defineConfig} from 'vite';

// export default defineConfig({
//   esbuild: {
//     jsx: 'automatic',
//     jsxDev: true,
//     jsxImportSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
//     jsxFragment: 'Fragment',
//     jsxFactory: 'createElement',
//   },
//   build: {
//     outDir: './dist',
//     lib: {
//       entry: ['./src/regan.ts'],
//       formats: ['es'],
//     },
//   },
// });

import {defineConfig} from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxDev: true,
    jsxImportSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
    jsxFragment: 'Fragment',
    jsxFactory: 'createElement',
  },
  build: {
    outDir: './dist',
    minify: false,
    terserOptions: {compress: false, mangle: false},
    lib: {
      entry: ['./src/regan.ts'],
      formats: ['es'],
    },
  },
});
