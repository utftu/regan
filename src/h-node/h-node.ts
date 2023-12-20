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
};

// HNode
export class HNode {
  children: HNode[] = [];
  mounts: MountUnmounFunc[] = [];
  unmounts: MountUnmounFunc[] = [];
  parent?: HNode;
  jsxSegment: JsxSegment;

  constructor({
    parent,
    jsxSegment,
    mounts = [],
    unmounts = [],
  }: PropsHydratedNode) {
    this.mounts = mounts;
    this.unmounts = unmounts;
    this.parent = parent;
    this.jsxSegment = jsxSegment;
  }

  mount() {
    this.mounts.forEach((fn) => fn(this));
  }

  unmount() {
    this.unmounts.forEach((fn) => fn(this));
  }

  addChildren(children: HNode[]) {
    children.forEach((hydratedNode) => this.children.push(hydratedNode));
  }
}
