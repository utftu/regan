# Regan

Легковесный JSX-фреймворк с SSR, hydration и реактивностью.

## Пакеты

| Пакет | Описание |
|-------|----------|
| [regan](./packages/regan) | Основная библиотека |
| [regan-vite](./packages/regan-vite) | Vite плагин |
| [run-local](./packages/run-local) | Dev-сервер для разработки |

## Быстрый старт

```bash
npm install regan regan-vite strangelove
```

```ts
// vite.config.ts
import {reganVite} from 'regan-vite';

export default {
  plugins: [reganVite()],
};
```

```tsx
// App.tsx
import {render} from 'regan';

const App = () => <h1>Hello, Regan!</h1>;

render(document.getElementById('root')!, <App />);
```

## Особенности

- **Легковесный** — минимальный размер бандла
- **SSR** — `stringify()` для серверного рендеринга
- **Hydration** — `hydrate()` для оживления HTML
- **Реактивность** — интеграция с атомами (strangelove)
- **TypeScript** — полная типизация

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Локальный dev-сервер
cd packages/run-local && npm run dev
```

## Лицензия

MIT
