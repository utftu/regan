# Regan

Лёгкий JSX-фреймворк: клиентский рендер, SSR, гидратация. Реактивность — на
атомах, компилятор не нужен, хватает штатного automatic JSX runtime.

## Установка

```bash
npm install regan strangelove
```

## Настройка

### TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "regan"
  }
}
```

### Vite

```ts
// vite.config.ts
import {defineConfig} from 'vite';
import {reganVite} from 'regan/vite';

export default defineConfig({
  plugins: [reganVite()],
});
```

Плагин задаёт `runtime: 'automatic'`, `importSource: 'regan'` и включает
dev-режим JSX при `mode === 'development'`. Он рассчитан на vite 8 и выше, где
JSX настраивается через `oxc`. Для vite 7 и ниже то же самое пишется вручную:

```ts
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'regan',
  },
});
```

## Быстрый старт

```tsx
import {render} from 'regan';

const App = () => <div>Hello, Regan!</div>;

render(document.getElementById('root')!, <App />);
```

### SSR + гидратация

```tsx
// server.ts
import {stringify} from 'regan';

const html = stringify(<App />);

// client.ts
import {hydrate} from 'regan';

hydrate(document.getElementById('root')!, <App />);
```

## Компоненты

Компонент — обычная функция. Она выполняется **один раз**: ни хуков, ни
массивов зависимостей, ни перерисовок при изменении пропов. Всё, что меняется
со временем, приходит атомами.

```tsx
import {FC} from 'regan';

const Button: FC<{label: string}> = ({label}) => {
  return <button>{label}</button>;
};
```

Второй аргумент — `ctx`:

```tsx
const Timer: FC = (props, ctx) => {
  ctx.mount(() => {
    const interval = setInterval(() => console.log('tick'), 1000);

    // вернули функцию — она станет unmount
    return () => clearInterval(interval);
  });

  return <div>Timer</div>;
};
```

## Реактивность

Атомы — из [strangelove](https://github.com/utftu/strangelove). Атом можно
поставить прямо в разметку или в проп, regan сам подпишется и будет обновлять
точечно.

```tsx
import {createAtom} from 'strangelove';
import {FC} from 'regan';

const Counter: FC = () => {
  const count = createAtom(0);

  return (
    <div>
      <span>{count}</span>
      <button click={() => count.set(count.get() + 1)}>+1</button>
    </div>
  );
};
```

Атом в пропе обновляет один атрибут, не пересобирая элемент:

```tsx
const theme = createAtom('light');

const Box: FC = () => <div class={theme} />;
```

Обработчики событий называются как сами события, без префикса: `click`,
`input`, `keydown`. Вторым аргументом приходит элемент.

```tsx
<input input={(event, element) => console.log(element.value)} />
```

## Списки и `key`

Атом со списком JSX рендерит список. Без ключей узлы сопоставляются по
позиции, с ключами — находят свою пару, даже если переехали.

```tsx
import {createAtom, select} from 'strangelove';

const items = createAtom([
  {id: 1, name: 'раз'},
  {id: 2, name: 'два'},
]);

const Row: FC<{name: string}> = ({name}) => <li>{name}</li>;

const rows = select((get) =>
  get(items).map((item) => <Row key={String(item.id)} name={item.name} />)
);

const List: FC = () => <ul>{rows}</ul>;
```

Что даёт `key`:

| | без ключа | ключ на теге | ключ на компоненте |
| --- | --- | --- | --- |
| узел находит свою пару после перестановки | — | да | да |
| DOM-узел переносится, а не пересоздаётся | — | да | да |
| тело компонента **не** выполняется заново | — | — | да |

Перенос DOM-узла — это сохранённый фокус, введённый текст, позиция скролла и
проигрываемое видео.

### Пропы компонента с ключом заморожены

Это главное, что нужно знать про `key` в regan. Компонент с неизменившимся
ключом **не запускается заново** — вместе с его замыканиями, локальными
атомами и подписками. Значит новые пропы до него не доедут:

```tsx
// name останется таким, каким был при создании строки
<Row key={item.id} name={item.name} />

// так правильно: меняющееся передаём атомом
<Row key={item.id} name={item.nameAtom} />
```

То же касается `children`. Компонент пересоздаётся, только если сменился ключ
или сменилась сама функция компонента.

Это обратная сторона модели «компонент выполняется один раз»: за неё платят
тем, что всё изменяемое живёт в атомах.

## Системные пропы

Принимают и теги, и компоненты, в `props` компонента не попадают — их видно в
`ctx.systemProps`.

### `key`

Идентичность узла в списке, см. выше.

### `ref`

Атом или функция, куда кладётся элемент после монтирования и `undefined`
после размонтирования.

```tsx
const box = createAtom<Element | undefined>(undefined);

const App: FC = () => <div ref={box} />;
```

### `rawHtml`

Содержимое элемента строкой. Дети такого элемента не разбираются и при
обновлении он создаётся заново.

```tsx
<div rawHtml='<b>жирный</b>' />
```

## Встроенные компоненты

| Компонент | Описание |
| --- | --- |
| `Fragment` | группировка без DOM-элемента |
| `Show` | условный рендер по атому |
| `AtomWrapper` | динамическая область вокруг атома; обычно не нужен — атом в разметке заворачивается сам |
| `ErrorGuard` | error boundary |
| `ErrorLogger` | логирование ошибок в консоль |

```tsx
import {Show} from 'regan';

const visible = createAtom(true);

<Show when={visible}>
  <div>видно</div>
</Show>;
```

```tsx
import {ErrorGuard} from 'regan';

<ErrorGuard handler={({error}) => <div>Ошибка: {error.message}</div>}>
  <App />
</ErrorGuard>;
```

`ErrorGuard` ловит падения и на первом рендере, и при обновлении динамической
области. Если запасной вариант тоже падает, ошибка уходит на `ErrorGuard`
выше. Если перехватить некому — она всплывает наружу через `reportError`, а
остальные обновления в этом же пакете всё равно выполняются.

## Context API

```tsx
import {createContext, FC} from 'regan';

const ThemeContext = createContext('theme', 'light');

const App: FC = () => (
  <ThemeContext.Provider value='dark'>
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

Рендерит JSX в DOM-элемент. `options.window` — для jsdom и тестов.

### `hydrate(element, node, options?)`

Оживляет готовую разметку. `options.errorHandlers` — глобальные обработчики
ошибок.

### `stringify(node, options?)`

Рендерит JSX в строку (SSR).

### `ctx` — второй аргумент компонента

| Метод | Описание |
| --- | --- |
| `ctx.mount(fn)` | вызывается при монтировании; возвращённая функция станет `unmount` |
| `ctx.unmount(fn)` | вызывается при размонтировании |
| `ctx.children` | дети, переданные компоненту |
| `ctx.systemProps` | `key`, `ref`, `rawHtml` |
| `ctx.getContext(context)` | значение контекста |
| `ctx.getId()` | id компонента по его месту в дереве |
| `ctx.getJsxPath()` | путь в дереве JSX |

`getId` и `getJsxPath` отражают текущее место в дереве, а не личность: после
перестановки списка они меняются. Для стабильной личности есть `key`.

## Разработка

```bash
bun install
bun test              # тесты
bun test --coverage   # покрытие
bun run types         # проверка типов
bun run build         # build:js + build:types
```

Песочница для ручной проверки — `run-local`, она подключается прямо к
исходникам через alias в своём `vite.config.ts`:

```bash
cd run-local && npx vite
```

Устройство фреймворка — в [AGENTS.md](./AGENTS.md), принятые решения и их
причины — в [docs/decisions.md](./docs/decisions.md).

## Лицензия

MIT
