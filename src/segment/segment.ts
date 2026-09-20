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
