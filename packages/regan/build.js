import {build} from 'vite';

const esbuild = {
  jsx: 'automatic',
  jsxDev: true,
  jsxImportSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
  jsxFragment: 'Fragment',
  jsxFactory: 'createElement',
};

const buildAll = () => {
  Promise.all([
    build({
      esbuild,
      build: {
        outDir: './dist',
        lib: {
          entry: ['./src/regan.ts'],
          formats: ['es'],
        },
      },
    }),
    build({
      esbuild,
      build: {
        outDir: './dist/dev',
        minify: false,
        lib: {
          entry: ['./src/regan.ts'],
          formats: ['es'],
        },
      },
    }),
  ]);
};
