import {build, defineConfig, ESBuildOptions, BuildOptions} from 'vite';
// @ts-ignore
// import StripCode from 'vite-plugin-strip-code';
import ConditionalCompile from 'vite-plugin-conditional-compiler';

const getEsbuildConfig = (
  mode: 'development' | 'production'
): ESBuildOptions => ({
  jsx: 'automatic',
  jsxDev: mode === 'development',
  jsxImportSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
  jsxFragment: 'Fragment',
  jsxFactory: 'createElement',
});

const buildOptions: BuildOptions = {
  emptyOutDir: false,
  outDir: './dist',
  lib: {
    entry: ['./src/regan.ts'],
    formats: ['es'],
  },
  rollupOptions: {
    external: ['strangelove'],
  },
};

const prodConfig = defineConfig({
  esbuild: getEsbuildConfig('production'),
  plugins: [ConditionalCompile()],
  build: {
    ...buildOptions,
  },
});

const devConfig = defineConfig({
  esbuild: getEsbuildConfig('development'),
  build: {
    ...buildOptions,
    outDir: './dist/dev',
    minify: false,
    sourcemap: true,
    target: 'esnext',
  },
});

await Promise.all([
  build(prodConfig),
  // build(devConfig)
]);
