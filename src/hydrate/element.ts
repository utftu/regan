import {Atom} from 'strangelove';
import {HydrateProps, destroyAtom} from '../node/node.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {selectRegan} from '../atoms/atoms.ts';
import {HNode} from '../h-node/h-node.ts';
import {handleChildrenHydrate} from './children.ts';
import {addEventListenerStore} from '../utils.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HNodeElement} from '../h-node/element.ts';

export async function hydrateElement(this: JSXNodeElement, ctx: HydrateProps) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
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

  const hNode = new HNodeElement({
    jsxSegment,
    mounts: [
      () => {
        return () => {
          atoms.forEach((atom) => destroyAtom(atom));
          element.remove();
        };
      },
    ],
    parent: ctx.parentHydratedNode,
    elem: element,
  });

  const {hNodes} = await handleChildrenHydrate({
    parentJsxSegment: jsxSegment,
    children: this.children,
    dom: {
      parent: element,
      position: 0,
    },
    parentHydratedNode: hNode,
    globalCtx: ctx.globalCtx,
  });

  hNode.addChildren(hNodes);

  return {insertedCount: 1, hNode};
}
