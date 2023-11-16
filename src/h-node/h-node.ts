type Unmount = () => any;
export type Mount = () => Unmount;

export class ComponentState {
  mounts = [];
  atoms = [];
}

type PropsHydratedNode = {
  mount: Mount;
  parent?: HNode;
  elem?: HTMLElement;
  segment: string;
};

// HNode
export class HNode {
  children: HNode[] = [];
  parent?: HNode;
  elem?: HTMLElement;
  segment: string;

  private mountFn: Mount;
  private unmountFn: Unmount | null = null;

  constructor({mount, parent, elem, segment}: PropsHydratedNode) {
    this.mountFn = mount;
    this.parent = parent;
    this.elem = elem;
    this.segment = segment;
  }

  mount() {
    this.unmountFn = this.mountFn();
  }

  unmount() {
    this.unmountFn?.();
  }

  addChildren(children: HNode[]) {
    children.forEach((hydratedNode) => this.children.push(hydratedNode));
  }
}
