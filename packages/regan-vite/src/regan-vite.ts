import {Plugin} from 'vite';

export const reganVite = () => {
  return {
    name: 'vite-plugin-regan',
    enforce: 'pre',
    config() {
      return {
        // While this config is unconditional, it'll only be used if Babel is not
        esbuild: {
          jsx: 'automatic',
          jsxDev: false,
          jsxImportSource: 'regan',
          jsxFragment: 'Fragment',
          jsxFactory: 'createElement',
        },
        // optimizeDeps: {
        //   include: ['preact/jsx-runtime', 'preact/jsx-dev-runtime'],
        // },
      };
    },
  } satisfies Plugin;
};
