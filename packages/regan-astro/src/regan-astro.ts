// my-framework-integration.ts
import type {AstroIntegration, ViteUserConfig} from 'astro';
import {reganVite} from 'regan-vite';

const clientEntrypoint = 'regan-astro/client.js';
const serverEntrypoint = 'regan-astro/server.js';

export function reganIntegration(): AstroIntegration {
  return {
    name: 'my-framework',
    hooks: {
      'astro:config:setup': ({addRenderer, updateConfig}) => {
        addRenderer({
          name: 'regan-integration',
          serverEntrypoint,
          clientEntrypoint,
          // serverEntrypoint: './server.js',
          // clientEntrypoint: './client.js',
        });

        const viteConfig: ViteUserConfig = {
          optimizeDeps: {
            include: [clientEntrypoint, 'regan', 'strangelove'],
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
