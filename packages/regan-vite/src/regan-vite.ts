import {Plugin} from 'vite';

export const reganVite = () => {
  return {
    name: 'vite-plugin-regan',
    enforce: 'pre',
    config(_, {mode}) {
      console.log('mode', mode);
      return {
        esbuild: {
          jsx: 'automatic',
          jsxDev: mode === 'development',
          jsxImportSource: 'regan',
          jsxFragment: 'Fragment',
          jsxFactory: 'createElement',
        },
      };
    },
  } satisfies Plugin;
};
