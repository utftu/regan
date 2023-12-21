import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {handleChildrenRender} from './children.ts';
import {HNode} from '../h-node/h-node.ts';
import {addEventListenerStore} from '../utils.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {RenderProps} from '../node/render/render.ts';
import {addElementChild} from './render.ts';
import {destroyAtom} from '../atoms/atoms.ts';

export async function renderElement(this: JSXNodeElement, ctx: RenderProps) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const element = ctx.globalCtx.window.document.createElement(this.type);

  const listeners: Record<string, any> = {};

  const mounts = [];

  for (const name in this.props) {
    const prop = this.props[name] as any;

    if (prop instanceof Atom) {
      const atomValue = ctx.renderCtx.snapshot.parse(prop);

      if (typeof atomValue === 'function') {
        addEventListenerStore({
          listener: atomValue,
          store: listeners,
          elem: element,
          name,
        });
      } else {
        element.setAttribute(name, atomValue);
      }

      const execTemp = () => {
        ctx.renderCtx.changedAtoms.push(prop);
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

  const hNode = new HNode({
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
    jsxSegment,
    parent: ctx.parentHNode,
    globalCtx: ctx.globalCtx,
  });

  ctx.addElementToParent(element);

  // todo add nodes
  const {hNodes} = await handleChildrenRender({
    children: this.children,
    parentHNode: hNode,
    dom: {parent: element},
    globalCtx: ctx.globalCtx,
    parentJsxSegment: jsxSegment,
    addElementToParent: (child: HTMLElement | string) =>
      addElementChild(element, child),
    renderCtx: ctx.renderCtx,
  });
  hNode.addChildren(hNodes);

  return {hNode};
}
