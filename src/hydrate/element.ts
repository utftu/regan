import {Atom} from 'strangelove';
import {HydrateProps, destroyAtom} from '../node/node.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {selectRegan, subscribeAtomChange} from '../atoms/atoms.ts';
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
      const value = ctx.hContext.snapshot.parse(prop);
      if (typeof value === 'function') {
        addEventListenerStore({
          listener: value,
          store: listeners,
          elem: element,
          name,
        });
      }

      const atom = subscribeAtomChange(prop, () => {
        const value = prop.get();

        if (typeof value === 'function') {
          addEventListenerStore({
            listener: value,
            store: listeners,
            elem: element,
            name,
          });
        } else {
          element.setAttribute(name, value);
        }
      });
      atoms.push(atom);

      // disable non func attrs for first run, in hydrate they should be already in html.
      // We should react only on change
      // let firstRun = true;
      // const atom = selectRegan((get) => {
      //   const value = get(prop);

      //   if (typeof value === 'function') {
      //     addEventListenerStore({
      //       listener: value,
      //       store: listeners,
      //       elem: element,
      //       name,
      //     });
      //   } else {
      //     if (firstRun === true) {
      //       firstRun = false;
      //     } else {
      //       element.setAttribute(name, value);
      //     }
      //   }
      // });
      // atoms.push(atom);
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
    // mounts: [
    //   () => {
    //     return () => {
    //       atoms.forEach((atom) => destroyAtom(atom));
    //       element.remove();
    //     };
    //   },
    // ],
    unmounts: [
      () => {
        atoms.forEach((atom) => destroyAtom(atom));
        element.remove();
      },
      () => {
        for (const listenerKey in listeners) {
          const listener = listeners[listenerKey];
          element.removeEventListener(listenerKey, listener);
        }
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
    hContext: ctx.hContext,
  });

  hNode.addChildren(hNodes);

  return {insertedCount: 1, hNode};
}
