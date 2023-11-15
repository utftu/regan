import {Atom} from 'strangelove';
import {Child} from '../../types.ts';
import {JSXNodeComponent} from '../component/component.ts';
import {JSXNodeElement} from '../element/element.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, JSXNode, destroyAtom} from '../node.ts';
import {joinPath} from '../../utils.ts';
import {SELECT_REGAN_NAMED} from '../../atoms/atoms.ts';

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

export const DYNAMIC_INSERTED_COUNT = Symbol('DYNAMIC_INSERTED_COUNT');
export const INSERTED_COUNT = Symbol('INSERTED_COUNT');

export async function handleChildrenHydrate({
  children,
  parentHydratedNode,
  dom,
  globalCtx,
  jsxPath,
}: {
  dom: DomProps;
  children: Child[];
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  jsxPath: string;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!(child instanceof JSXNode) && !(child instanceof Atom)) {
      continue;
    }

    let childNode!: JSXNode;
    let additionalName = '';
    if (child instanceof Atom) {
      let value: any;
      let name: string;
      if ((child as any)[SELECT_REGAN_NAMED]) {
        [name, value] = child.get();
      } else {
        value = child.get();
        name = '0';
      }

      if (value instanceof JSXNode) {
        childNode = value;
        additionalName = `:a=${name}`;
      } else {
        continue;
      }
    } else {
      childNode = child;
    }

    const hydrateResult = childNode.hydrate({
      jsxPath: joinPath(jsxPath, jsxNodeCount.toString()) + additionalName,
      dom: {parent: dom.parent, position},
      parentHydratedNode,
      globalCtx,
    });
    hydrateResults.push(hydrateResult);

    if (childNode instanceof JSXNodeElement) {
      position++;
    } else if (childNode instanceof JSXNodeComponent) {
      if (INSERTED_COUNT in childNode.type) {
        if (childNode.type[INSERTED_COUNT] !== DYNAMIC_INSERTED_COUNT) {
          position += childNode.type[INSERTED_COUNT] as number;
        } else {
          const awaitedhydratedResult = await hydrateResult;
          position += awaitedhydratedResult.insertedCount;
        }
      } else {
        position++;
      }
    }

    jsxNodeCount++;
  }

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedCount: position - dom.position,
    hydratedNodes: hydrateResultsData.map(({hydratedNode}) => {
      return hydratedNode;
    }),
  };
}

function mountHydratedNodes(elem: HNode) {
  elem.mount();
  elem.children.forEach(mountHydratedNodes);
}

type HydrateConfig = {
  window?: Window;
  jsxPath?: string;
};

export async function hydrate(
  domNode: HTMLElement,
  node: JSXNode,
  config: HydrateConfig = {window}
) {
  const {hydratedNode} = await node.hydrate({
    jsxPath: config.jsxPath || '',
    dom: {parent: domNode, position: 0},
    parentHydratedNode: undefined,
    globalCtx: new GlobalCtx({
      window: config.window || window,
      status: 'hydrate',
    }),
  });

  mountHydratedNodes(hydratedNode);
}
