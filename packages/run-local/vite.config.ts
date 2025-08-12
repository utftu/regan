import {defineConfig} from 'vite';
import {reganVite} from 'regan-vite';

export default defineConfig({
  plugins: [reganVite()],
  build: {
    rollupOptions: {
      external: ['strangelove'],
    },
  },
});
