# regan-vite

Vite плагин для [Regan](../regan) — автоматическая настройка JSX.

## Установка

```bash
npm install regan-vite regan
```

## Использование

```ts
// vite.config.ts
import {defineConfig} from 'vite';
import {reganVite} from 'regan-vite';

export default defineConfig({
  plugins: [reganVite()],
});
```

Плагин автоматически настраивает:

- `jsx: 'automatic'`
- `jsxImportSource: 'regan'`
- `jsxDev: true` в режиме development

## Без плагина

Если не хотите использовать плагин, настройте вручную:

```ts
// vite.config.ts (vite 8+, через oxc)
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'regan',
    },
  },
});
```

```ts
// vite.config.ts (vite 7 и ниже, через esbuild)
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'regan',
  },
});
```

## Лицензия

MIT
