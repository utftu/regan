# regan

JSX-фреймворк: клиентский рендер, SSR, гидратация. Реактивность — на атомах
[strangelove](https://www.npmjs.com/package/strangelove), компилятор не нужен,
хватает штатного automatic JSX runtime.

Один пакет, публикуется как `regan`. Размер сборки — 26 КБ, 7.7 КБ gzip.

## Стек

Bun (тесты и сборка), TypeScript strict, jsdom в тестах, prettier,
[dapes](https://www.npmjs.com/package/dapes) для задач сборки и публикации.

## Команды

```bash
bun test          # 143 теста
bun run types     # tsc --noEmit
bun run build     # js + d.ts в dist/
bun run watch     # пересборка js
```

Публикация — `bun run dapes.global.ts publish` (types → build → publish с
бампом patch-версии).

Песочница для ручной проверки — `run-local/`, поднимается своим vite.

## Три стадии

Одно и то же дерево JSX умеет три вещи, и у каждой свой обход:

| стадия | вход | выход | где |
|---|---|---|---|
| `stringify` | JsxNode | строка HTML | `src/stringify/` |
| `hydrate` | JsxNode + готовый DOM | HNode | `src/hydrate/` |
| `render` | JsxNode | RenderNode → DOM + HNode | `src/render/` + `src/v/apply.ts` |

`JsxNode` — что написано в JSX. `RenderNode` — описание узла до того, как
появился DOM. `HNode` — живое дерево после рендера, оно переживает обновления.

## Кто что делает

### Вход

- **`src/jsx/`** — то, во что компилируется JSX. `jsx.ts` собирает `JsxNode`,
  `props.ts` отделяет системные пропы (`key`, `ref`, `rawHtml`) от
  пользовательских, `elements.ts` и `types.ts` — типы тегов и JSX-неймспейс,
  `FOR_JSX/` — точка входа для `jsxImportSource` при разработке самого regan.
- **`src/jsx-node/`** — классы `JsxNodeElement` и `JsxNodeComponent`. У каждого
  три метода: `render`, `hydrate`, `stringify` — по стадии на каждый.

### Рендер

- **`src/render/children.ts`** — обход детей. Нормализует значения (функции
  зовёт, примитивы в текст, массивы и атомы заворачивает), подбирает каждому
  ребёнку старый узел через `align.ts` и решает, не оставить ли компонент
  нетронутым.
- **`src/render/align.ts`** — `createMatcher(oldHNodes)`: потоковый
  сопоставитель, отдаёт пару по одному ребёнку. Без ключей — по позиции, с
  ключами — по ключу.
- **`src/render/element.ts` / `component.ts`** — строят `RenderNode`, запускают
  тело компонента, вешают подписки на динамические пропы.
- **`src/render/render.ts`** — `render()` (точка входа) и `renderRaw()` (её же
  зовёт `AtomWrapper` при обновлении).
- **`src/v/apply.ts`** — единственный, кто трогает DOM на клиенте.
  Материализация: создаёт узлы, патчит пропы, переставляет, удаляет то, чему не
  нашлось пары. Пары ему приносит рендер, сам он ничего не сопоставляет.

### Живое дерево

- **`src/h-node/`** — `HNodeElement` (несёт `element`, `tag`, снимок `props`,
  `listenerManager`), `HNodeText` (`textNode`), `HNodeComponent` (DOM не несёт).
  `find/` — поиск предыдущего DOM-узла вверх по дереву, нужен, чтобы понять,
  куда вставлять новое содержимое динамической области.

### Реактивность

- **`src/components/atom-wrapper/`** — сердце реактивности. Любой атом среди
  детей заворачивается в `AtomWrapper`; на изменение он перерисовывает своё
  поддерево. Быстрый путь для одиночного текста — запись в `textContent`.
  `insert-point.ts` считает, куда вставлять.
- **`src/updater/`** — батчинг: подписки копятся и выполняются одним
  микротаском.
- **`src/utils/props.ts`** — разделение статических и динамических пропов,
  подписка на атом в пропе.

### Остальное

- **`src/ctx/`** — `Ctx`, то, что компонент получает вторым аргументом:
  `mount`, `unmount`, `children`, `getContext`, `getJsxPath`, `getId`.
- **`src/segment/`** — `SegmentEnt`: позиция узла в дереве JSX плюс ссылка на
  `hNode`. `jsx-path/` считает путь и id.
- **`src/context/`** — контекст через цепочку `ContextEnt`.
- **`src/errors/`** — `ErrorRegan`, единый `handleError`, логгер.
- **`src/components/`** — `Fragment`, `Show`, `ErrorGuard`.
- **`src/subpackages/vite.ts`** — плагин vite, настраивает `oxc.jsx`.
- **`src/utils/check-parent.ts`** — номинальная типизация по строке вместо
  `instanceof`, чтобы не тащить классы друг к другу в импорты.

## Что снаружи

`src/regan.ts` — публичный экспорт. Подпути пакета: `regan`,
`regan/jsx-runtime`, `regan/jsx-dev-runtime`, `regan/vite`.

Потребитель — [h11-x](https://github.com/utftu/h11): SSR-слой поверх h11 + vite
+ regan.
