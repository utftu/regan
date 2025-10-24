// vitest.config.ts
import {defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config.ts';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        setupFiles: ['./src/context/context.tsx'],
        coverage: {
          provider: 'istanbul', // or 'v8'
        },
      },
    })
  )
);
