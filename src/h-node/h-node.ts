import {JsxSegment} from '../jsx-path/jsx-path.ts';

type Unmount = () => any;
export type Mount = () => Unmount;

export class ComponentState {
  mounts = [];
  atoms = [];
}

type MountUnmounFunc = (hNode: HNode) => void;

type PropsHydratedNode = {
  // mount: Mount;
  mounts?: MountUnmounFunc[];
  unmounts?: MountUnmounFunc[];
  parent?: HNode;
  elem?: HTMLElement;
  // segment: string;
  jsxSegment: JsxSegment;
};

// HNode
export class HNode {
  children: HNode[] = [];
  mounts: MountUnmounFunc[] = [];
  unmounts: MountUnmounFunc[] = [];
  parent?: HNode;
  elem?: HTMLElement;
  // segment: string;
  jsxSegment: JsxSegment;

  // private mountFn: Mount;
  // private unmountFn: Unmount | null = null;

  constructor({
    parent,
    elem,
    jsxSegment,
    mounts = [],
    unmounts = [],
  }: PropsHydratedNode) {
    this.mounts = mounts;
    this.unmounts = unmounts;
    // this.mountFn = mount;
    this.parent = parent;
    this.elem = elem;
    this.jsxSegment = jsxSegment;
    // this.segment = segment;
  }

  mount() {
    this.mounts.forEach((fn) => fn(this));
    // this.unmountFn = this.mountFn();
  }

  unmount() {
    this.unmounts.forEach((fn) => fn(this));
    // this.unmountFn?.();
  }

  addChildren(children: HNode[]) {
    children.forEach((hydratedNode) => this.children.push(hydratedNode));
  }
}
