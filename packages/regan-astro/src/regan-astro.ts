import type {AstroIntegration} from 'astro';

// my-framework-integration.js
export default function reganIntegration(): AstroIntegration {
  return {
    name: 'my-framework',
    hooks: {
      'astro:config:setup': ({addRenderer}: any) => {
        addRenderer({
          name: 'regan-integration',
          serverEntrypoint: './server.js',
          clientEntrypoint: './client.js',
        });
      },
    },
  };
}
