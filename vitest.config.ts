import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: true,
    jsxImportSource: fileURLToPath(
      new URL('./packages/regan/src/jsx/FOR_JSX', import.meta.url)
    ),
    jsxFragment: 'Fragment',
    jsxFactory: 'createElement',
  },
});
