// vite.config.js
import {defineConfig} from 'vite';
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
      'my-jsx': './src/jsx/jsx-runtime',
    },
  },
});
