import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {handleChildrenHydrate} from './children.ts';
import {addEventListenerStore} from '../utils.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HNode} from '../h-node/h-node.ts';
import {HydrateProps} from '../node/hydrate/hydrate.ts';
import {HNodeElement} from '../h-node/element.ts';

export async function hydrateElement(this: JSXNodeElement, ctx: HydrateProps) {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const element = ctx.dom.parent.children[ctx.dom.position] as HTMLElement;

  const listeners: Record<string, any> = {};
  const mounts = [];
  const unmounts = [
    () => {
      element.remove();
    },
    () => {
      for (const listenerKey in listeners) {
        const listener = listeners[listenerKey];
        element.removeEventListener(listenerKey, listener);
      }
    },
  ];

  for (const name in this.props) {
    const prop = this.props[name] as any;

    if (prop instanceof Atom) {
      const atomValue = ctx.hCtx.snapshot.parse(prop);

      if (typeof atomValue === 'function') {
        addEventListenerStore({
          listener: atomValue,
          store: listeners,
          elem: element,
          name,
        });
      }

      const execTemp = () => {
        ctx.hCtx.changedAtoms.push(prop);
      };
      ctx.globalCtx.root.addExec(prop, execTemp);
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
      mounts.push(() => ctx.globalCtx.root.replaceExec(prop, execTemp, exec));
      unmounts.push(() => ctx.globalCtx.root.removeExec(prop, exec));
    } else if (typeof prop === 'function') {
      addEventListenerStore({
        listener: prop,
        store: listeners,
        elem: element,
        name,
      });
    }
  }

  const hNode = new HNodeElement(
    {
      hNodeCtx: ctx.hNodeCtx,
      jsxSegment,
      mounts,
      unmounts,
      parent: ctx.parentHNode,
      globalCtx: ctx.globalCtx,
    },
    element
  );

  const {hNodes} = await handleChildrenHydrate({
    parentJsxSegment: jsxSegment,
    hNodeCtx: ctx.hNodeCtx,
    children: this.children,
    dom: {
      parent: element,
      position: 0,
    },
    parentHNode: hNode,
    globalCtx: ctx.globalCtx,
    hCtx: ctx.hCtx,
  });

  hNode.addChildren(hNodes);

  return {insertedCount: 1, hNode};
}
