import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {destroyAtom} from '../node/node.ts';
import {handleChildrenRender} from './children.ts';
import {HNode} from '../h-node/h-node.ts';
import {addEventListenerStore} from '../utils.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {RenderProps} from '../node/render/render.ts';
import {addElementChild} from './render.ts';

export async function renderElement(this: JSXNodeElement, ctx: RenderProps) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const element = ctx.globalCtx.window.document.createElement(this.type);

  const listeners: Record<string, any> = {};

  const atoms: Atom[] = [];
  const mounts = [];

  for (const name in this.props) {
    const prop = this.props[name] as any;

    if (prop instanceof Atom) {
      const atomValue = ctx.renderCtx.snapshot.parse(prop);

      // todo
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

    // const execTemp = () => {
    //   ctx.renderContext.changedAtoms.push(prop);
    // };
    // ctx.globalCtx.root.addExec(prop, execTemp);
    // mounts.push((hNode: HNode) => {
    //   const exec = (value: any) => {
    //     if (typeof value === 'function') {
    //       addEventListenerStore({
    //         listener: value,
    //         store: listeners,
    //         elem: element,
    //         name,
    //       });
    //     } else {
    //       element.setAttribute(name, value);
    //     }
    //   };
    //   ctx.globalCtx.root.replaceExec(prop, execTemp, exec);
    //   hNode.unmounts.push(() => ctx.globalCtx.root.removeExec(prop, exec));
    // });

    // if (prop instanceof Atom) {
    //   const atom = selectRegan((get) => {
    //     const value = get(prop);

    //     if (typeof value === 'function') {
    //       addEventListenerStore({
    //         listener: value,
    //         store: listeners,
    //         elem: element,
    //         name,
    //       });
    //     } else {
    //       element.setAttribute(name, value);
    //     }
    //   });
    //   atoms.push(atom);
    //   continue;
    // }

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
    // elem: element,
    mounts: [
      () => {
        return () => {
          atoms.forEach((atom) => destroyAtom(atom));
          element.remove();
        };
      },
    ],
    jsxSegment,
    parent: ctx.parentHNode,
    globalCtx: ctx.globalCtx,
  });

  ctx.addElementToParent(element);
  // ctx.dom.parent.appendChild(element);

  // todo add nodes
  await handleChildrenRender({
    children: this.children,
    parentHNode: hNode,
    dom: {parent: element},
    globalCtx: ctx.globalCtx,
    parentJsxSegment: jsxSegment,
    addElementToParent: (child: HTMLElement | string) =>
      addElementChild(element, child),
    renderCtx: ctx.renderCtx,
  });

  return {hNode};
}
