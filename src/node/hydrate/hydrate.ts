import {Atom, createDefaultRoot} from 'strangelove';
import {Child, JSXNode, JSXNodeComponent, JSXNodeElement} from '../node.ts';
import {runOnPromise} from '../../utils.ts';

type Unmount = () => void | Promise<void>;
export type Mount = () => Unmount | Promise<Unmount>;

export class ElementNode {
  element: HTMLElement;

  constructor({element}: {element: HTMLElement}) {
    this.element = element;
  }
}

export class HydratedComponentNode {
  atom: Atom;

  private _mount: Mount;
  private _unmount: ReturnType<Mount> | null = null;

  mount() {
    this.atom.update({
      data: {
        status: 'mount',
      },
    });
  }

  unmount() {
    this.atom.update({
      data: {
        status: 'unmount',
      },
    });
  }

  constructor({mount}: {mount: Mount}) {
    this._mount = mount;
    this._unmount = mount();
    const self = this;
    this.atom = Atom.new<void>({
      exec(atom: Atom, {data}: {data: {status: 'mount' | 'unmount'}}) {
        if (data.status === 'unmount') {
          if (self._unmount === null) {
            return true;
          }

          runOnPromise(self._unmount, (unmount) => unmount());
          self._unmount = null;
          return true;
        } else if (data.status === 'mount') {
          if (self._unmount === null) {
            self._unmount = self._mount();

            return true;
          }

          runOnPromise(self._unmount, (unmount) => unmount());
          self._unmount = self._mount();
          return true;
        }
        return true;
      },
      root: createDefaultRoot(),
    });
  }
}

// export class HydratedComponentNode {
//   async new({mount, parent}: {mount: Mount; parent: HydratedComponentNode}) {
//     const unmount = (await mount()) || noop;

//     return new HydratedComponentNode({mount, unmount, parent});
//   }

//   constructor({mount, unmount, parent}: {parent: HydratedComponentNode}) {
//     const root = createDefaultRoot();
//     this.mount = Atom.new({exec: mount, root});
//     connectAtoms(parent.mount, this.mount);
//     this.unmount = Atom.new({exec: unmount, root});
//     connectAtoms(parent.unmount, this.unmount);
//   }

//   mount: Atom;
//   unmount: Atom;
// }

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
