import {build, ESBuildOptions} from 'vite';

const esbuild: ESBuildOptions = {
  jsx: 'automatic',
  jsxDev: true,
  jsxImportSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
  jsxFragment: 'Fragment',
  jsxFactory: 'createElement',
};

const buildAll = () => {
  Promise.all([
    // build({
    //   esbuild,
    //   build: {
    //     sourcemap: false,
    //     outDir: './dist',
    //     lib: {
    //       entry: ['./src/regan.ts'],
    //       formats: ['es'],
    //     },
    //   },
    // }),
    build({
      esbuild,
      build: {
        sourcemap: true,
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

await buildAll();
