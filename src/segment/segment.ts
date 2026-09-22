import {ContextEnt} from '../context/context.tsx';
import {GlobalCtxBoth} from '../ctx/global.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';

// Место узла в дереве JSX: имя своего сегмента плюс ссылки на соседей по
// дереву — родителя, контекст, созданный HNode.
export class SegmentEnt {
  // номер среди детей родителя; AtomWrapper дописывает к нему номер обновления
  name: string;
  jsxNode: JsxNode;
  parentSegmentEnt: SegmentEnt | undefined;
  contextEnt: ContextEnt | undefined;
  hNode?: HNode;
  globalCtx: GlobalCtxBoth;

  constructor({
    name,
    parentSegmentEnt,
    jsxNode,
    contextEnt,
    globalCtx,
  }: {
    name: string;
    parentSegmentEnt: SegmentEnt | undefined;
    jsxNode: JsxNode;
    contextEnt: ContextEnt | undefined;
    globalCtx: GlobalCtxBoth;
  }) {
    this.name = name;
    this.parentSegmentEnt = parentSegmentEnt;
    this.jsxNode = jsxNode;
    this.contextEnt = contextEnt;
    this.globalCtx = globalCtx;
  }

  // Путь считается каждый раз заново, по живой цепочке родителей.
  // Кэшировать его нельзя: сохранённое поддерево переезжает вместе с
  // ключом, и закэшированный путь тут же перестаёт быть правдой.
  getJsxPath(): string {
    return getJsxPath(this);
  }

  getId(): string {
    return djb2(this.getJsxPath());
  }

  // Путь для человека: <App><Table><tbody:1><Row:37><li>.
  // getJsxPath() даёт машинный идентификатор позиции и для чтения не годится.
  //
  // Имена берутся у функций компонентов, а минификатор их переименовывает —
  // в продовой сборке вместо <Row:37> будет <e:37>. Где имя важно и в проде,
  // помогает Row.displayName = 'Row'. Номера верны всегда.
  getNamedPath(): string {
    return getNamedPath(this);
  }
}

const getName = (segmentEnt: SegmentEnt) => {
  const jsxNode = segmentEnt.jsxNode;

  if (!jsxNode) {
    return 'unknown';
  }

  if (jsxNode.type === 'element') {
    return jsxNode.tagName;
  }

  // displayName переживает минификацию, а имя функции — нет
  return jsxNode.component.displayName || jsxNode.component.name || 'anonymous';
};

// Fragment, AtomWrapper, ContextProvider и прочие обёртки самого regan
// человек не писал, в разметке их нет — в пути они только мешают.
const checkInternal = (segmentEnt: SegmentEnt) => {
  const jsxNode = segmentEnt.jsxNode;

  if (!jsxNode || jsxNode.type === 'element') {
    return false;
  }

  return jsxNode.component.reganInternal === true;
};

// Номер среди детей родителя: он и отличает одинаковых соседей друг от друга.
// У корня его нет, у первого ребёнка не пишем — ноль ничего не уточняет.
const getSegment = (segmentEnt: SegmentEnt) => {
  const name = getName(segmentEnt);

  if (segmentEnt.name === '' || segmentEnt.name === '0') {
    return `<${name}>`;
  }

  return `<${name}:${segmentEnt.name}>`;
};

export function getNamedPath(segmentEnt: SegmentEnt): string {
  const names: string[] = [];
  let current: SegmentEnt | undefined = segmentEnt;

  while (current) {
    if (checkInternal(current) === false) {
      names.push(getSegment(current));
    }

    current = current.parentSegmentEnt;
  }

  return names.reverse().join('');
}

export function getJsxPath(segmentEnt: SegmentEnt, childJsxPath = ''): string {
  const jsxPath = joinPath(segmentEnt.name, childJsxPath);

  if (segmentEnt.parentSegmentEnt) {
    return getJsxPath(segmentEnt.parentSegmentEnt, jsxPath);
  }

  return jsxPath;
}

export function joinPath(oldPart = '', newPart = '') {
  if (newPart === '') {
    return oldPart;
  }

  if (oldPart === '') {
    return newPart;
  }

  return `${oldPart}.${newPart}`;
}

export function djb2(str: string) {
  let hash = 5381;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  // убираем знак, возвращаем положительное число
  return (hash >>> 0).toString();
}
