import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {reganVite} from '../src/subpackages/vite.ts';

const reganPath = fileURLToPath(new URL('../src/regan.ts', import.meta.url));

export default defineConfig({
  plugins: [reganVite()],
  resolve: {
    alias: [
      {find: 'regan/jsx-runtime', replacement: reganPath},
      {find: 'regan/jsx-dev-runtime', replacement: reganPath},
      {find: 'regan', replacement: reganPath},
    ],
  },
  build: {
    rollupOptions: {
      external: ['strangelove'],
    },
  },
});
