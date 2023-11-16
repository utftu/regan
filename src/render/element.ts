import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {RenderProps} from '../node/node.ts';
import {selectRegan} from '../atoms/atoms.ts';
import {handleChildrenRender} from './children.ts';
import {HNode} from '../h-node/h-node.ts';
import {addEventListenerStore} from '../utils.ts';

export async function renderElement(this: JSXNodeElement, ctx: RenderProps) {
  const element = ctx.globalCtx.window.document.createElement(this.type);

  const listeners: Record<string, any> = {};

  const atoms: Atom[] = [];

  for (const name in this.props) {
    const prop = this.props[name] as any;

    if (prop instanceof Atom) {
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
          element.setAttribute(name, value);
        }
      });
      atoms.push(atom);
      continue;
    }

    if (typeof prop === 'function') {
      addEventListenerStore({
        name,
        listener: prop,
        store: listeners,
        elem: element,
      });
    } else {
      element.setAttribute(name, prop);
    }
  }

  const hydratedNode = new HNode({
    mount: () => {
      return () => {
        atoms.forEach((atom) => destroyAtom(atom));
        element.remove();
      };
    },
    parent: ctx.parentHNode,
    elem: element,
  });

  ctx.dom.parent.appendChild(element);

  // todo add nodes
  await handleChildrenRender({
    children: this.children,
    parentHydratedNode: hydratedNode,
    dom: {parent: element},
    globalCtx: ctx.globalCtx,
    jsxPath: ctx.jsxPath,
  });

  return {hydratedNode};
}
