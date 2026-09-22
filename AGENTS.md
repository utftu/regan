# regan

JSX-фреймворк: клиентский рендер, SSR, гидратация. Реактивность — на атомах
[strangelove](https://www.npmjs.com/package/strangelove), компилятор не нужен,
хватает штатного automatic JSX runtime.

Один пакет, публикуется как `regan`. 59 файлов, 3892 строки без тестов, сборка
25.3 КБ / 7.9 КБ gzip.

## Стек

Bun (тесты и сборка), TypeScript strict, jsdom в тестах, prettier,
[dapes](https://www.npmjs.com/package/dapes) для задач сборки и публикации.

## Команды

```bash
bun test          # 196 тестов
bun run types     # tsc --noEmit
bun run build     # js + d.ts в dist/
bun run watch     # пересборка js
```

Публикация — `bun run dapes.global.ts publish` (types → build → publish с бампом
patch-версии).

Песочница для ручной проверки — `run-local/`, поднимается своим vite. Бенчмарки
— `bench/`, как запускать написано в [bench/README.md](./bench/README.md).

## Три стадии

Одно и то же дерево JSX умеет три вещи, и у каждой свой обход:

| стадия      | вход                  | выход                    | где              |
| ----------- | --------------------- | ------------------------ | ---------------- |
| `stringify` | JsxNode               | строка HTML              | `src/stringify/` |
| `hydrate`   | JsxNode + готовый DOM | HNode                    | `src/hydrate/`   |
| `render`    | JsxNode               | RenderNode → DOM + HNode | `src/render/`    |

`JsxNode` — что написано в JSX, обычные данные с полем `type`. `RenderNode` —
описание узла до того, как появился DOM, плюс ссылка на свою пару в прошлом
дереве. `HNode` — живое дерево после рендера, оно переживает обновления.

Общее у стадий вынесено в `src/jsx-node/`: разбор детей и запуск компонента.

## Кто что делает

### Вход

- **`src/jsx/`** — то, во что компилируется JSX. `jsx.ts` собирает `JsxNode`,
  `props.ts` отделяет системные пропы (`key`, `ref`, `rawHtml`) от
  пользовательских, `elements.ts` и `types.ts` — типы тегов и JSX-неймспейс,
  `FOR_JSX/` — точка входа для `jsxImportSource` при разработке самого regan.
- **`src/jsx-node/jsx-node.ts`** — `JsxNode` как размеченное объединение
  (`element` / `component`) плюс фабрики и `checkJsxNode`. Методов у узла нет:
  что с ним делать, решает стадия своим `switch`.

### Общее для трёх стадий

- **`src/jsx-node/children.ts`** — `walkChildren`: нормализация детей из JSX.
  Зовёт ленивые функции, пропускает пустые значения, заворачивает атомы и
  массивы, нумерует сегменты. Одна копия на три стадии — пока их было три,
  стадии успели разойтись по пустой строке и по текстовым разделителям.
- **`src/jsx-node/component.ts`** — `runComponent`: контекст, сегмент, `Ctx`,
  вызов тела компонента. И `getErrorGuardChildren`: решает, чем заменить детей,
  если разбор упал внутри `ErrorGuard`.

### Рендер

- **`src/render/children.ts`** — обход детей на стороне рендера: подбор пары
  через `align.ts` и решение, не оставить ли компонент нетронутым.
- **`src/render/align.ts`** — `createMatcher(oldHNodes)`: потоковый
  сопоставитель, отдаёт пару по одному ребёнку. Без ключей — по позиции, с
  ключами — по ключу.
- **`src/render/element.ts` / `component.ts`** — строят `RenderNode`, вешают
  подписки на динамические пропы.
- **`src/render/render.ts`** — `render()` (точка входа) и `renderRaw()` (её же
  зовёт `AtomWrapper` при обновлении).
- **`src/render/apply.ts`** — обход: в каком порядке создавать, переставлять и
  удалять. Пары ему приносит рендер, сам он ничего не сопоставляет.
- **`src/render/dom.ts`** — всё, что делается с самим DOM: создать узел (с
  пространством имён для SVG), поставить на место, пропатчить пропы, убрать.

### Живое дерево

- **`src/h-node/`** — `HNode` как размеченное объединение: `HNodeElement` (несёт
  `element`, `tag`, снимок `props`, `listenerManager`), `HNodeText`
  (`textNode`), `HNodeComponent` (DOM не несёт). `find.ts` — поиск предыдущего
  DOM-узла вверх и влево, нужен динамической области, чтобы понять, куда
  вставлять.

### Реактивность

- **`src/components/atom-wrapper/`** — сердце реактивности. Любой атом среди
  детей заворачивается в `AtomWrapper`; на изменение он перерисовывает своё
  поддерево. Быстрый путь для одиночного текста — запись в `textContent`.
  `insert-point.ts` считает, куда вставлять, `subscribe.ts` — подписку.
- **`src/updater/`** — батчинг: подписки копятся и выполняются одним
  микротаском. Падение одной не роняет остальные.
- **`src/utils/props.ts`** — разделение статических и динамических пропов,
  подписка на атом в пропе.
- **`src/utils/attributes.ts`** — во что превратить значение пропа в разметке:
  строки и числа идут как есть, `true` ставит пустой атрибут, остальное атрибут
  снимает. Плюс `style` объектом.

### Остальное

- **`src/ctx/ctx.ts`** — `Ctx`, то, что компонент получает вторым аргументом:
  `mount`, `unmount`, `children`, `systemProps`, `getContext`, `getJsxPath`,
  `getId`. **`ctx/global.ts`** — `GlobalCtx` и `AreaCtx`.
- **`src/segment/segment.ts`** — `SegmentEnt`: позиция узла в дереве JSX, ссылка
  на `hNode`, вычисление пути и id.
- **`src/context/`** — контекст через цепочку `ContextEnt`.
- **`src/errors/errors.ts`** — что такое ошибка regan: класс (несёт `place`,
  `segmentEnt` и путь `path`), типы, создание, опознание, контекст обработчиков.
  **`handle.ts`** — что с ней делают: `handleError`, `prepareListener`,
  `throwGlobalSystemError`. **`report.ts`** — как показывают непойманную.
- **`src/components/`** — `Fragment`, `Show`, `ErrorGuard`. Служебные компоненты
  regan помечены `reganInternal` и не показываются в пути ошибки.
- **`src/subpackages/vite.ts`** — плагин vite: настраивает `oxc.jsx` и в
  dev-режиме включает `output.keepNames`, чтобы имена компонентов в путях ошибок
  пережили сборку.

## Чего в коде нет специально

**`instanceof`** — ломается, если в дереве зависимостей окажутся две копии
пакета. Вид узла определяется полем `type`, ошибка regan — полем `reganError`.

**Кэша путей** — `getJsxPath()` считается по живой цепочке родителей каждый раз.
Сохранённое поддерево переезжает вместе с ключом, и закэшированный путь сразу
перестаёт быть правдой.

## Что снаружи

`src/regan.ts` — публичный экспорт. Подпути пакета: `regan`,
`regan/jsx-runtime`, `regan/jsx-dev-runtime`, `regan/vite`.

Потребитель — [h11-x](https://github.com/utftu/h11): SSR-слой поверх h11, vite и
regan.

Принятые решения и их причины — в [docs/decisions.md](./docs/decisions.md),
пользовательская документация — в [README.md](./README.md).
