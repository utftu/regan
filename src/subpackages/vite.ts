import type {Plugin, UserConfig} from 'vite';

export function reganVite(): Plugin {
  return {
    name: 'vite-plugin-regan',
    enforce: 'pre',
    config(_, {mode}) {
      const development = mode === 'development';

      return {
        oxc: {
          jsx: {
            runtime: 'automatic',
            importSource: 'regan',
            development,
          },
        },
        build: {
          rollupOptions: {
            output: {
              keepNames: development,
            },
          },
        },
      } as UserConfig;
    },
  };
}
