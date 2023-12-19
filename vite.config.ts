// vite.config.js
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

console.log('-----', 'import.meta', import.meta);

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
});
