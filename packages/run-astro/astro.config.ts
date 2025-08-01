import {defineConfig} from 'astro/config';
// import reganIntegration from './regan-intergration.ts';
import {reganIntegration} from 'regan-astro';
//
// import client from 'regan-astro/client.js';
// import server from 'regan-astro/server.js';

// console.log('-----', 'client func', client);
// console.log('-----', 'server', server);
// console.log('-----', 'reganIntegration', reganIntegration);

export default defineConfig({
  // renderers: [reganRenderer],
  integrations: [reganIntegration()],
  // vite: {
  //   esbuild: {
  //     jsx: 'automatic',
  //     jsxFactory: 'createElement',
  //     jsxFragment: 'Fragment',
  //     jsxImportSource: 'regan',
  //   },
  // },
});
