import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      outDir: './dist/types',
    }),
  ],
  build: {
    outDir: './dist',
    lib: {
      entry: ['./src/regan-vite.ts'],
      formats: ['es'],
    },
  },
});
