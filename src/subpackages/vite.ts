import type {Plugin, UserConfig} from 'vite';

export function reganVite(): Plugin {
  return {
    name: 'vite-plugin-regan',
    enforce: 'pre',
    config(_, {mode}) {
      return {
        oxc: {
          jsx: {
            runtime: 'automatic',
            importSource: 'regan',
            development: mode === 'development',
          },
        },
      } as UserConfig;
    },
  };
}
