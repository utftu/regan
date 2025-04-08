import {defineConfig} from 'astro/config';
import reganIntegration from './regan-intergration.ts';

export default defineConfig({
  // renderers: [reganRenderer],
  integrations: [reganIntegration()],
  vite: {
    esbuild: {
      jsx: 'automatic',
      jsxFactory: 'createElement',
      jsxFragment: 'Fragment',
      jsxImportSource: 'regan',
    },
  },
});
