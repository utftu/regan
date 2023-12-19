// vitest.config.ts
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({jsxImportSource: 'my-jsx'})],
  // esbuild: {
  //   jsxFactory: 'jsx',
  //   jsxFragment: 'Fragment',
  //   jsxInject: `import {jsx} from 'my-jsx'`,
  // },
  resolve: {
    alias: {
      'my-jsx': new URL('./src/jsx/jsx-runtime', import.meta.url).pathname,
    },
  },
  test: {
    coverage: {
      provider: 'istanbul', // or 'v8'
    },
  },
});
