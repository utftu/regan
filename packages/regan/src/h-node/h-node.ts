import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';

export type Unmount = () => any;
export type Mount<THNode extends HNode = HNode> = (hNode: THNode) => any;

export class ComponentState {
  mounts = [];
  unmounts = [];
}

export type MountUnmounFunc = (hNode: HNode) => void;

export type PropsHNode = {
  mounts?: MountUnmounFunc[];
  unmounts?: MountUnmounFunc[];
  children?: HNode[];
  parent?: HNode;
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  segmentEnt: SegmentEnt;
};

export class HNode {
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
    children.forEach((child) => {
      this.children.push(child);
      child.parent = this;
    });
  }
}
