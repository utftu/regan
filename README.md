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

Компонент — обычная функция. Она выполняется **один раз**: ни хуков, ни массивов
зависимостей, ни перерисовок при изменении пропов. Всё, что меняется со
временем, приходит атомами.

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

Там их два вида: `createAtom` даёт источник, в который пишут, а `select` —
производное значение, только для чтения (`Ion`). Regan принимает оба везде, где
значение читается.

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

Обработчики событий называются как сами события, без префикса: `click`, `input`,
`keydown`. Обработчик получает один объект — `{event, element}`.

```tsx
<input input={({element}) => console.log(element.value)} />
```

### Поля ввода связаны с атомом в обе стороны

Атом-источник в `value`, `checked` или `selected` — это связка: regan и пишет в
элемент, и кладёт введённое обратно в атом. Обработчик для этого не нужен:

```tsx
const text = createAtom('');

<input value={text} />;
<input type='checkbox' checked={agreed} />;
```

Свой обработчик рядом работает как обычно, но срабатывает раньше записи в атом —
читайте в нём `element`, а не атом.

Когда значением распоряжается код — фильтр, маска, проверка перед записью —
обратную запись отменяют. `unbind` принимает только источник: у производного
значения отменять нечего.

```tsx
import {unbind} from 'regan';

<input
  value={unbind(phone)}
  input={({element}) => {
    if (/^\d*$/.test(element.value)) {
      phone.set(element.value);
      return;
    }

    // значение в атоме не изменилось — возвращаем его в поле
    phone.update();
  }}
/>;
```

`atom.update()` будит подписчиков, даже когда значение осталось прежним, и regan
переписывает поле тем, что лежит в атоме. Каретка при этом остаётся на месте:
отвергнутая буква исчезает, а курсор стоит там же, где стоял.

Производное значение из `select` связывать не надо: писать в него нечем, и regan
это видит сам — такой проп остаётся односторонним.

## Списки и `key`

Атом со списком JSX рендерит список. Без ключей узлы сопоставляются по позиции,
с ключами — находят свою пару, даже если переехали.

```tsx
import {createAtom, select} from 'strangelove';

const items = createAtom([
  {id: 1, name: 'раз'},
  {id: 2, name: 'два'},
]);

const Row: FC<{name: string}> = ({name}) => <li>{name}</li>;

const rows = select((get) =>
  get(items).map((item) => <Row key={String(item.id)} name={item.name} />),
);

const List: FC = () => <ul>{rows}</ul>;
```

Что даёт `key`:

|                                           | без ключа | ключ на теге | ключ на компоненте |
| ----------------------------------------- | --------- | ------------ | ------------------ |
| узел находит свою пару после перестановки | —         | да           | да                 |
| DOM-узел переносится, а не пересоздаётся  | —         | да           | да                 |
| тело компонента **не** выполняется заново | —         | —            | да                 |

Перенос DOM-узла — это сохранённый фокус, введённый текст, позиция скролла и
проигрываемое видео.

### Пропы компонента с ключом заморожены

Это главное, что нужно знать про `key` в regan. Компонент с неизменившимся
ключом **не запускается заново** — вместе с его замыканиями, локальными атомами
и подписками. Значит новые пропы до него не доедут:

```tsx
// name останется таким, каким был при создании строки
<Row key={item.id} name={item.name} />

// так правильно: меняющееся передаём атомом
<Row key={item.id} name={item.nameAtom} />
```

То же касается `children`. Компонент пересоздаётся, только если сменился ключ
или сменилась сама функция компонента.

Это обратная сторона модели «компонент выполняется один раз»: за неё платят тем,
что всё изменяемое живёт в атомах.

## Системные пропы

Принимают и теги, и компоненты, в `props` компонента не попадают — их видно в
`ctx.systemProps`.

### `key`

Идентичность узла в списке, см. выше.

### `ref`

Атом или функция, куда кладётся элемент после монтирования и `undefined` после
размонтирования.

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

| Компонент     | Описание                                                                                |
| ------------- | --------------------------------------------------------------------------------------- |
| `Fragment`    | группировка без DOM-элемента                                                            |
| `Show`        | условный рендер по атому                                                                |
| `AtomWrapper` | динамическая область вокруг атома; обычно не нужен — атом в разметке заворачивается сам |
| `ErrorGuard`  | error boundary                                                                          |
| `ErrorLogger` | логирование ошибок в консоль                                                            |

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
области. Если запасной вариант тоже падает, ошибка уходит на `ErrorGuard` выше.
Если перехватить некому — она всплывает наружу через `reportError`, а остальные
обновления в этом же пакете всё равно выполняются.

`ErrorLogger` — это тот же `ErrorGuard`, чей обработчик печатает ошибку в
консоль и бросает её дальше: показывает и не глушит.

### Все ошибки в одном месте

`render`, `hydrate` и `stringify` принимают `errorHandlers` — их зовут на каждую
ошибку, включая перехваченную:

```tsx
render(element, <App />, {
  errorHandlers: [
    ({error, handled}) => {
      Sentry.captureException(error, {extra: {path: error.path, handled}});
    },
  ],
});
```

`handled` означает, что какой-то `ErrorGuard` подменил разметку. Обработчик,
который сам бросил, перехватившим не считается.

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

Оживляет готовую разметку.

### `stringify(node, options?)`

Рендерит JSX в строку (SSR).

Все три принимают `options.errorHandlers` и `options.data`.

### `ctx` — второй аргумент компонента

| Метод                     | Описание                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| `ctx.mount(fn)`           | вызывается при монтировании; возвращённая функция станет `unmount` |
| `ctx.unmount(fn)`         | вызывается при размонтировании                                     |
| `ctx.children`            | дети, переданные компоненту                                        |
| `ctx.systemProps`         | `key`, `ref`, `rawHtml`                                            |
| `ctx.getContext(context)` | значение контекста                                                 |
| `ctx.getId()`             | id компонента по его месту в дереве                                |
| `ctx.getJsxPath()`        | путь в дереве JSX                                                  |

`getId` и `getJsxPath` отражают текущее место в дереве, а не личность: после
перестановки списка они меняются. Для стабильной личности есть `key`.

### Ошибки показывают место

Сообщение об ошибке и `ErrorLogger` печатают путь до узла:

```
Invalid child of type object in <App><ul><Row:4><li>
```

Имя в угловых скобках, через двоеточие — номер среди детей родителя; у первого
ребёнка номер не пишется. Обёрток самого regan — `Fragment`, `AtomWrapper`,
провайдеров контекста — в пути нет, хотя в дереве они есть: вы их не писали.

Номера верны всегда, а имена берутся у функций компонентов, и минификатор их
переименовывает.

Dev-сервер не минифицирует вообще — там имена целы сами по себе. Плагин
`regan/vite` добавляет к этому dev-сборку: при `mode === 'development'` он
включает `keepNames`, и `vite build --mode development` тоже сохраняет имена.
Прод-сборка не меняется.

Путь лежит в `error.path` — и у ошибки, которую видит обработчик `ErrorGuard`, и
у той, что никто не перехватил: такая печатается сама, отдельной строкой перед
ошибкой, без всяких подключений.

```
regan: место ошибки: <App><Table><tbody:1><Row:37><li>
Uncaught TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

Если имя нужно и в проде — поставьте его строкой, её минификатор не трогает:

```tsx
const List: FC = () => <ul>{rows}</ul>;
List.displayName = 'List';
```

## Разработка

```bash
bun install
bun test              # тесты
bun test --coverage   # покрытие
bun run types         # проверка типов
bun run build         # build:js + build:types
```

Песочница для ручной проверки — `run-local`, она подключается прямо к исходникам
через alias в своём `vite.config.ts`:

```bash
cd run-local && npx vite
```

Устройство фреймворка — в [AGENTS.md](./AGENTS.md), принятые решения и их
причины — в [docs/decisions.md](./docs/decisions.md).

## Лицензия

MIT
