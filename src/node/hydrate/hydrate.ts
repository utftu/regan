import {Atom, FastUpdater, connectAtoms, createDefaultRoot} from 'strangelove';
import {Child, JSXNode, JSXNodeComponent, JSXNodeElement} from '../node.ts';
import {noop} from '../../consts.ts';

type Unmount = () => void | Promise<void>;
type Mount = () => Unmount | void | Promise<Unmount | void>;

export class ElementNode {
  element: HTMLElement;

  constructor({element}: {element: HTMLElement}) {
    this.element = element;
  }
}

export class HydratedComponentNode {
  async new({mount, parent}: {mount: Mount; parent: HydratedComponentNode}) {
    const unmount = (await mount()) || noop;

    return new HydratedComponentNode({mount, unmount, parent});
  }

  constructor({mount, unmount, parent}: {parent: HydratedComponentNode}) {
    const root = createDefaultRoot();
    this.mount = Atom.new({exec: mount, root});
    connectAtoms(parent.mount, this.mount);
    this.unmount = Atom.new({exec: unmount, root});
    connectAtoms(parent.unmount, this.unmount);
  }

  mount: Atom;
  unmount: Atom;
}

export async function handleChildrenHydrate({
  children,
  parent,
}: {
  children: Child[];
  parent: ElementNode;
}) {
  const promises = [];
  let insertedCount = 0;
  for (let i = 0; i <= children.length; i++) {
    const child = children[i];
    if (typeof child === 'string') {
      continue;
    }

    if (child instanceof JSXNodeElement) {
      promises.push(
        child.hydrate({
          parent,
          position: insertedCount,
        })
      );
      insertedCount++;
      continue;
    } else if (child instanceof JSXNodeComponent) {
      const hydratedResult = await child.hydrate({
        parent,
        position: insertedCount,
      });
      insertedCount += hydratedResult.insertedCount;
    }
  }

  const promisesResult = await Promise.all(promises);

  insertedCount += promisesResult.reduce(
    (prev, {insertedCount}) => prev + insertedCount,
    0
  );

  return insertedCount;
}

export async function hydrate(domNode: HTMLElement, node: JSXNode) {
  const elementNode = new ElementNode({element: domNode});
  await node.hydrate({parent: elementNode, position: 0});
}
