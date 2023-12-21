import {Atom} from 'strangelove';
import {HydrateProps, destroyAtom} from '../node/node.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {handleChildrenHydrate} from './children.ts';
import {addEventListenerStore} from '../utils.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HNode} from '../h-node/h-node.ts';

export async function hydrateElement(this: JSXNodeElement, ctx: HydrateProps) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const element = ctx.dom.parent.children[ctx.dom.position] as HTMLElement;

  const listeners: Record<string, any> = {};
  const mounts = [];

  for (const name in this.props) {
    const prop = this.props[name] as any;

    if (prop instanceof Atom) {
      const atomValue = ctx.hContext.snapshot.parse(prop);

      // todo
      if (typeof atomValue === 'function') {
        addEventListenerStore({
          listener: atomValue,
          store: listeners,
          elem: element,
          name,
        });
      }

      const execTemp = () => {
        ctx.hContext.changedAtoms.push(prop);
      };
      ctx.globalCtx.root.addExec(prop, execTemp);
      mounts.push((hNode: HNode) => {
        const exec = (value: any) => {
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
        };
        ctx.globalCtx.root.replaceExec(prop, execTemp, exec);
        hNode.unmounts.push(() => ctx.globalCtx.root.removeExec(prop, exec));
      });
    } else if (typeof prop === 'function') {
      addEventListenerStore({
        listener: prop,
        store: listeners,
        elem: element,
        name,
      });
    }
  }

  const hNode = new HNode({
    jsxSegment,
    unmounts: [
      () => {
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
    globalCtx: ctx.globalCtx,
    // elem: element,
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
