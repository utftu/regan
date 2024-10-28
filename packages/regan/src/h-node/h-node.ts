import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {SegmentComponent} from '../segments/component.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {DomPointer} from '../types.ts';
import {HNodeElementToReplace, HNodeVText} from '../v/h-node.ts';
import {HNodeComponent} from './component.ts';
import {HNodeElement} from './element.ts';
import {HNodeText} from './text.ts';

type Unmount = () => any;
export type Mount = () => Unmount;

export class ComponentState {
  mounts = [];
  unmounts = [];
  atoms = [];
}

export type MountUnmounFunc = (hNode: HNodeBase) => void;

export type PropsHNode = {
  mounts?: MountUnmounFunc[];
  unmounts?: MountUnmounFunc[];
  children?: HNode[];
  parent?: HNode;
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  segmentEnt: SegmentEnt;
  segmentComponent?: SegmentComponent;
};

export class HNodeBase {
  children: HNode[];
  mounts: MountUnmounFunc[];
  unmounts: MountUnmounFunc[];
  parent?: HNode;
  globalCtx: GlobalCtx;
  glocalClientCtx: GlobalClientCtx;
  segmentEnt: SegmentEnt;
  systemUnmounts: Unmount[] = [];

  data: Record<string, any> = {};

  constructor({
    parent,
    mounts = [],
    unmounts = [],
    children = [],
    globalCtx,
    globalClientCtx,
    segmentEnt,
  }: PropsHNode) {
    this.mounts = mounts;
    this.unmounts = unmounts;
    this.parent = parent;
    this.globalCtx = globalCtx;
    this.glocalClientCtx = globalClientCtx;
    this.children = children;
    this.segmentEnt = segmentEnt;
  }

  unmounted = false;

  mount() {
    this.mounts.forEach((fn) => fn(this));
  }

  unmount() {
    this.unmounts.forEach((fn) => fn(this));
    this.unmounted = true;
  }

  addChildren(children: HNode[]) {
    children.forEach((hNode) => this.children.push(hNode));
  }
}

export class GlobalClientCtx {
  initDomPointer: DomPointer;
  window: Window;

  constructor({
    window: localWindow,
    initDomPointer,
  }: {
    initDomPointer: DomPointer;
    window: Window;
  }) {
    this.initDomPointer = initDomPointer;
    this.window = localWindow;
  }
}

export type HNode = HNodeComponent | HNodeElement | HNodeText;
// | HNodeElementToReplace
// | HNodeVText;
