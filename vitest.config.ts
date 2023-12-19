// vitest.config.ts
import {defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: 'istanbul', // or 'v8'
      },
    },
  })
);
