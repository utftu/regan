import {defineConfig, UserConfig} from 'vite';

export default defineConfig(({mode}) => {
  const config: UserConfig = {
    esbuild: {
      jsx: 'automatic',
      jsxDev: mode === 'development',
      jsxImportSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
      jsxFragment: 'Fragment',
      jsxFactory: 'createElement',
    },
    build: {
      emptyOutDir: false,
      outDir: './dist',
      lib: {
        entry: ['./src/regan.ts'],
        formats: ['es'],
      },
      rollupOptions: {
        external: ['strangelove'],
      },
    },
  };
  return config;
});
