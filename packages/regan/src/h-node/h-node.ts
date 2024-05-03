import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {ElementPointer} from '../types.ts';

type Unmount = () => any;
export type Mount = () => Unmount;

export class ComponentState {
  mounts = [];
  unmounts = [];
  atoms = [];
}

type MountUnmounFunc = (hNode: HNode) => void;

export type PropsHNode = {
  mounts?: MountUnmounFunc[];
  unmounts?: MountUnmounFunc[];
  parent?: HNode;
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;
  hNodeCtx: HNodeCtx;
};

// HNode = HydratedNode
// attribute for interactive component
export class HNode {
  children: HNode[] = [];
  mounts: MountUnmounFunc[] = [];
  unmounts: MountUnmounFunc[] = [];
  parent?: HNode;
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;
  hNodeCtx: HNodeCtx;

  constructor({
    parent,
    jsxSegment,
    mounts = [],
    unmounts = [],
    globalCtx,
    hNodeCtx,
  }: PropsHNode) {
    this.mounts = mounts;
    this.unmounts = unmounts;
    this.parent = parent;
    this.jsxSegment = jsxSegment;
    this.globalCtx = globalCtx;
    this.hNodeCtx = hNodeCtx;
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

export const mountHNodes = (hNode: HNode) => {
  hNode.mount();
  hNode.children.forEach((hNode) => mountHNodes(hNode));
};

export const unmountHNodes = (hNode: HNode) => {
  hNode.unmount();
  hNode.children.forEach((hNode) => unmountHNodes(hNode));
};

export class HNodeCtx {
  getInitElemPointer: () => ElementPointer;
  window: Window;

  constructor({
    getInitElemPointer,
    window: localWindow,
  }: {
    getInitElemPointer: () => ElementPointer;
    window: Window;
  }) {
    this.getInitElemPointer = getInitElemPointer;
    this.window = localWindow;
  }
}
