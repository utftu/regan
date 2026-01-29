# Regan

Легковесный JSX-фреймворк с поддержкой SSR, hydration и реактивности через атомы.

## Установка

```bash
npm install regan strangelove
```

## Настройка

### TypeScript / Vite

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "regan"
  }
}
```

## Быстрый старт

### Рендеринг на клиенте

```tsx
import {render, Fragment} from 'regan';

const App = () => <div>Hello, Regan!</div>;

render(document.getElementById('root')!, <App />);
```

### SSR + Hydration

```tsx
// server.ts
import {stringify} from 'regan';

const html = stringify(<App />);

// client.ts
import {hydrate} from 'regan';

hydrate(document.getElementById('root')!, <App />);
```

## Компоненты

### Функциональные компоненты

```tsx
import {FC} from 'regan';

const Button: FC<{label: string}> = ({label}, ctx) => {
  return <button>{label}</button>;
};
```

### Lifecycle

```tsx
const Timer: FC = (props, ctx) => {
  ctx.mount((hNode) => {
    const interval = setInterval(() => console.log('tick'), 1000);
    
    // Возврат функции = unmount
    return () => clearInterval(interval);
  });

  return <div>Timer</div>;
};
```

## Реактивность

Используется библиотека [strangelove](https://github.com/utftu/strangelove) для атомов.

```tsx
import {Atom} from 'strangelove';
import {AtomWrapper} from 'regan';

const Counter: FC = () => {
  const count = new Atom(0);

  return (
    <div>
      <AtomWrapper atom={count}>{count.get()}</AtomWrapper>
      <button onClick={() => count.set(count.get() + 1)}>+1</button>
    </div>
  );
};
```

## Встроенные компоненты

| Компонент | Описание |
|-----------|----------|
| `Fragment` | Группировка без DOM-элемента |
| `AtomWrapper` | Реактивная обёртка для атомов |
| `Show` | Условный рендеринг |
| `ErrorGuard` | Error boundary |
| `ErrorLogger` | Логирование ошибок |

## Context API

```tsx
import {createContext, FC} from 'regan';

const ThemeContext = createContext('light');

const App: FC = () => (
  <ThemeContext.Provider value="dark">
    <Child />
  </ThemeContext.Provider>
);

const Child: FC = (props, ctx) => {
  const theme = ctx.getContext(ThemeContext);
  return <div>Theme: {theme}</div>;
};
```

## API

### `render(element, node, options?)`

Рендерит JSX в DOM-элемент.

### `hydrate(element, node, options?)`

Гидратирует существующий HTML.

### `stringify(node, options?)`

Рендерит JSX в строку (SSR).

### `ctx` (второй аргумент компонента)

| Метод | Описание |
|-------|----------|
| `ctx.mount(fn)` | Регистрирует callback при монтировании |
| `ctx.unmount(fn)` | Регистрирует callback при размонтировании |
| `ctx.getContext(context)` | Получает значение контекста |
| `ctx.getId()` | Уникальный ID компонента |
| `ctx.getJsxPath()` | Путь в JSX-дереве |

## Лицензия

MIT
