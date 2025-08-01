import type {AstroIntegration, ViteUserConfig} from 'astro';
import {reganVite} from 'regan-vite';

const clientEntrypoint = './regan/client.js';
const serverEntrypoint = './regan/server.js';

// my-framework-integration.js
export default function reganIntegration(): AstroIntegration {
  return {
    name: 'my-framework',
    hooks: {
      'astro:config:setup': ({addRenderer, updateConfig}: any) => {
        addRenderer({
          name: 'regan-integration',
          serverEntrypoint: './regan/server.js',
          clientEntrypoint: './regan/client.js',
        });

        // updateConfig({
        //   vite: {
        //     plugins: [reganVite()],
        //   },
        // });

        const viteConfig: ViteUserConfig = {
          optimizeDeps: {
            include: [clientEntrypoint],
            exclude: [serverEntrypoint],
          },
          plugins: [reganVite()],
        };

        updateConfig({
          vite: viteConfig,
        });
      },
    },
  };
}
