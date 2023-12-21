import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';

type Unmount = () => any;
export type Mount = () => Unmount;

export class ComponentState {
  mounts = [];
  atoms = [];
}

type MountUnmounFunc = (hNode: HNode) => void;

export type PropsHydratedNode = {
  mounts?: MountUnmounFunc[];
  unmounts?: MountUnmounFunc[];
  parent?: HNode;
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;
};

// HNode
export class HNode {
  children: HNode[] = [];
  mounts: MountUnmounFunc[] = [];
  unmounts: MountUnmounFunc[] = [];
  parent?: HNode;
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;

  constructor({
    parent,
    jsxSegment,
    mounts = [],
    unmounts = [],
    globalCtx,
  }: PropsHydratedNode) {
    this.mounts = mounts;
    this.unmounts = unmounts;
    this.parent = parent;
    this.jsxSegment = jsxSegment;
    this.globalCtx = globalCtx;
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
    children.forEach((hydratedNode) => this.children.push(hydratedNode));
  }
}
