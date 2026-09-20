import {GlobalCtx} from '../ctx/global.ts';
import {HNode, MountUnmounFunc} from '../h-node/h-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Props} from '../types.ts';
import {ListenerManager} from '../utils/listeners.ts';

// Описание узла до того, как появился DOM. Форма совпадает с HNode:
// HNode — это ровно то же самое плюс ссылка на созданный узел.
type RenderNodeBase = {
  segmentEnt: SegmentEnt;
  globalCtx: GlobalCtx;
  mounts: MountUnmounFunc[];
  unmounts: MountUnmounFunc[];
  children: RenderNode[];
  // узел прошлого дерева, который здесь переиспользуется; подбирает его
  // align на этапе рендера, потому что только там известны обе стороны
  oldHNode?: HNode;
};

export type RenderNodeElement = RenderNodeBase & {
  type: 'element';
  tag: string;
  props: Props;
  rawHtml?: string;
  listenerManager: ListenerManager;
};

export type RenderNodeText = RenderNodeBase & {
  type: 'text';
  text: string;
};

export type RenderNodeComponent = RenderNodeBase & {
  type: 'component';
};

// Компонент с тем же ключом не перезапускался — его поддерево переезжает
// в новое дерево как есть, вместе со всем своим состоянием.
export type RenderNodeKeep = {
  type: 'keep';
  oldHNode: HNode;
};

export type RenderNode =
  | RenderNodeElement
  | RenderNodeText
  | RenderNodeComponent
  | RenderNodeKeep;

export type RenderNodeDom = RenderNodeElement | RenderNodeText;
