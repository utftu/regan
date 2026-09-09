import {defineConfig, UserConfig} from 'vite';

export default defineConfig(({mode}) => {
  const config: UserConfig = {
    oxc: {
      jsx: {
        runtime: 'automatic',
        importSource: new URL('./src/jsx/FOR_JSX', import.meta.url).pathname,
        development: mode === 'development',
      },
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
