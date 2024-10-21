import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
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
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;
  hNodeCtx: HNodeCtx;
};

export class HNodeBase {
  children: HNode[];
  mounts: MountUnmounFunc[];
  unmounts: MountUnmounFunc[];
  parent?: HNode;
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;
  hNodeCtx: HNodeCtx;

  data: Record<string, any> = {};

  constructor({
    parent,
    jsxSegment,
    mounts = [],
    unmounts = [],
    children = [],
    globalCtx,
    hNodeCtx,
  }: PropsHNode) {
    this.mounts = mounts;
    this.unmounts = unmounts;
    this.parent = parent;
    this.jsxSegment = jsxSegment;
    this.globalCtx = globalCtx;
    this.hNodeCtx = hNodeCtx;
    this.children = children;
  }

  unmounted = false;

  mount() {
    this.mounts.forEach((fn) => fn(this));
  }

  unmount() {
    this.unmounts.forEach((fn) => fn(this));
    this.unmounted = true;
  }

  addChildren(children: HNodeBase[]) {
    children.forEach((hNode) => this.children.push(hNode));
  }
}

export const mountHNodes = (hNode: HNodeBase) => {
  hNode.mount();
  hNode.children.forEach((hNode) => mountHNodes(hNode));
};

export const unmountHNodes = (hNode: HNodeBase) => {
  hNode.unmount();
  hNode.children.forEach((hNode) => unmountHNodes(hNode));
};

export class HNodeCtx {
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
