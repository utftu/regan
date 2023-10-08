import {JSXNodeComponent} from '../component/component.ts';
import {JSXNodeElement} from '../element/element.ts';
import {Child, DomProps, JSXNode} from '../node.ts';

type Unmount = () => any;
export type Mount = () => Unmount;

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
  // parentElement,
  parentHydratedNode,
  // insertedCountStart = 0,
  dom,
}: {
  dom: DomProps;
  children: Child[];
  // parentElement: HTMLElement;
  parentHydratedNode?: HydratedNode;
  // insertedCountStart?: number;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  // let insertedCount = insertedCountStart;
  for (let i = 0; i <= children.length; i++) {
    const child = children[i];
    if (typeof child === 'string' || !child) {
      continue;
    }

    const hydrateResult = child.hydrate({
      dom: {parent: dom.parent, position},
      parentHydratedNode,
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

export async function hydrate(domNode: HTMLElement, node: JSXNode) {
  const {hydratedNode} = await node.hydrate({
    dom: {parent: domNode, position: 0},
    parentHydratedNode: undefined,
  });

  mountHydratedNodes(hydratedNode);
}
