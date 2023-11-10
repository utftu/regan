import {JSXNodeComponent} from '../component/component.ts';
import {JSXNodeElement} from '../element/element.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Child, DomProps, JSXNode, destroyAtom} from '../node.ts';

type Unmount = () => any;
export type Mount = () => Unmount;

export class ComponentState {
  mounts = [];
  atoms = [];
}

type PropsHydratedNode = {
  mount: Mount;
  parent?: HydratedNode;
  dom?: DomProps;
};

export class HydratedNode {
  children: HydratedNode[] = [];
  parent?: HydratedNode;
  dom?: DomProps;

  private mountFn: Mount;
  private unmountFn: Unmount | null = null;

  constructor({mount, parent, dom}: PropsHydratedNode) {
    this.mountFn = mount;
    this.parent = parent;
    this.dom = dom;
  }

  mount() {
    this.unmountFn = this.mountFn();
  }

  unmount() {
    this.unmountFn?.();
  }

  addChildren(children: HydratedNode[]) {
    children.forEach((hydratedNode) => this.children.push(hydratedNode));
  }
}

export const DYNAMIC_INSERTED_COUNT = Symbol('DYNAMIC_INSERTED_COUNT');
export const INSERTED_COUNT = Symbol('INSERTED_COUNT');

export async function handleChildrenHydrate({
  children,
  parentHydratedNode,
  dom,
  globalCtx,
}: {
  dom: DomProps;
  children: Child[];
  parentHydratedNode?: HydratedNode;
  globalCtx: GlobalCtx;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0; i <= children.length; i++) {
    const child = children[i];
    if (typeof child === 'string' || !child) {
      continue;
    }

    const hydrateResult = child.hydrate({
      dom: {parent: dom.parent, position},
      parentHydratedNode,
      globalCtx,
    });
    hydrateResults.push(hydrateResult);

    if (child instanceof JSXNodeElement) {
      position++;
    } else if (child instanceof JSXNodeComponent) {
      if (INSERTED_COUNT in child.type) {
        if (child.type[INSERTED_COUNT] !== DYNAMIC_INSERTED_COUNT) {
          position += child.type[INSERTED_COUNT] as number;
        } else {
          const awaitedhydratedResult = await hydrateResult;
          position += awaitedhydratedResult.insertedCount;
        }
      } else {
        position++;
      }
    }
  }

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedCount: position - dom.position,
    hydratedNodes: hydrateResultsData.map(({hydratedNode}) => {
      return hydratedNode;
    }),
  };
}

function mountHydratedNodes(elem: HydratedNode) {
  elem.mount();
  elem.children.forEach(mountHydratedNodes);
}

type HydrateConfig = {
  window?: Window;
};

export async function hydrate(
  domNode: HTMLElement,
  node: JSXNode,
  config: HydrateConfig = {window}
) {
  const {hydratedNode} = await node.hydrate({
    dom: {parent: domNode, position: 0},
    parentHydratedNode: undefined,
    globalCtx: new GlobalCtx({
      window: config.window,
    }),
  });

  mountHydratedNodes(hydratedNode);
}
