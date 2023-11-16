import {Atom} from 'strangelove';
import {HydrateProps} from '../node/node.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {selectRegan} from '../atoms/atoms.ts';
import {HNode} from '../h-node/h-node.ts';
import {handleChildrenHydrate} from './children.ts';
import {addEventListenerStore} from '../utils.ts';

export async function hydrateElement(this: JSXNodeElement, ctx: HydrateProps) {
  const element = ctx.dom.parent.children[ctx.dom.position] as HTMLElement;

  const listeners: Record<string, any> = {};

  const atoms: Atom[] = [];
  for (const name in this.props) {
    const prop = this.props[name] as any;

    if (prop instanceof Atom) {
      // disable non func attrs for first run, in hydrate they should be already in html.
      // We should react only on change
      let firstRun = true;
      const atom = selectRegan((get) => {
        const value = get(prop);

        if (typeof value === 'function') {
          addEventListenerStore({
            listener: value,
            store: listeners,
            elem: element,
            name,
          });
        } else {
          if (firstRun === true) {
            firstRun = false;
          } else {
            element.setAttribute(name, value);
          }
        }
      });
      atoms.push(atom);
    } else {
      if (typeof prop === 'function') {
        addEventListenerStore({
          listener: prop,
          store: listeners,
          elem: element,
          name,
        });
      }
    }
  }

  const hydratedNode = new HNode({
    mount: () => {
      return () => {
        atoms.forEach((atom) => destroyAtom(atom));
        element.remove();
      };
    },
    parent: ctx.parentHydratedNode,
    elem: element,
  });

  const {hydratedNodes} = await handleChildrenHydrate({
    jsxPath: ctx.jsxPath,
    children: this.children,
    dom: {
      parent: element,
      position: 0,
    },
    parentHydratedNode: hydratedNode,
    globalCtx: ctx.globalCtx,
  });

  hydratedNode.addChildren(hydratedNodes);

  return {insertedCount: 1, hydratedNode};
}
