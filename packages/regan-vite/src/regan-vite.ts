import {Plugin} from 'vite';

export const reganVite = () => {
  return {
    name: 'vite-plugin-regan',
    enforce: 'pre',
    config(_, {mode}) {
      console.log('mod', mode);
      return {
        // While this config is unconditional, it'll only be used if Babel is not
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
