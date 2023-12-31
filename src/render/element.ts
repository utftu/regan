import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {handleChildrenRender} from './children.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {addEventListenerStore} from '../utils.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {RenderProps} from '../node/render/render.ts';
import {HNodeElement} from '../h-node/element.ts';
import {appendElementChild} from '../utils/dom.ts';

export async function renderElement(this: JSXNodeElement, ctx: RenderProps) {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const element = ctx.hNodeCtx.window.document.createElement(this.type);

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

  const hNode = new HNodeElement(
    {
      unmounts,
      mounts,
      jsxSegment,
      parent: ctx.parentHNode,
      globalCtx: ctx.globalCtx,
      hNodeCtx: ctx.hNodeCtx,
    },
    element
  );

  ctx.addElementToParent(element);

  const {hNodes} = await handleChildrenRender({
    children: this.children,
    parentHNode: hNode,
    globalCtx: ctx.globalCtx,
    parentJsxSegment: jsxSegment,
    addElementToParent: (child: HTMLElement | string) => {
      appendElementChild({parent: element, el: child});
    },
    renderCtx: ctx.renderCtx,
    hNodeCtx: ctx.hNodeCtx,
  });
  hNode.addChildren(hNodes);

  return {hNode};
}
