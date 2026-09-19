import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {MountUnmounFunc} from '../h-node/h-node.ts';
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

export type RenderNode =
  | RenderNodeElement
  | RenderNodeText
  | RenderNodeComponent;

export type RenderNodeDom = RenderNodeElement | RenderNodeText;
