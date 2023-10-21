import {Atom, select} from 'strangelove';
import {NodeCtx, Props} from '../../types.ts';
import {HydratedNode, handleChildrenHydrate} from '../hydrate/hydrate.ts';
import {
  DomProps,
  GetStringStreamProps,
  HydrateProps,
  JSXNode,
  RenderProps,
  destroyAtom,
} from '../node.ts';
import {createElementString, handleChildrenString} from '../string/string.ts';
import {addEventListenerStore, handleChildrenRender} from '../render/render.ts';
import {selectRegan} from '../../utils.ts';

export class JSXNodeElement<TProps extends Props>
  extends JSXNode<string, TProps>
  implements JSXNode<string, TProps>
{
  async getStringStream(ctx: GetStringStreamProps) {
    const streams = new TransformStream<string, string>();

    const preparedProps = Object.entries(this.props).reduce(
      (store, [key, value]) => {
        if (typeof value === 'function') {
          return store;
        }
        const realValue = value instanceof Atom ? value.get() : value;
        store[key] = realValue;
        return store;
      },
      {} as Record<string, any>
    );

    const elementString = createElementString({
      type: this.type,
      props: preparedProps,
    });

    Promise.resolve().then(async () => {
      const writer = streams.writable.getWriter();

      await writer.write(elementString.left);
      writer.releaseLock();

      await handleChildrenString({
        children: this.children,
        ctx,
        streams,
      });

      // todo
      const writer2 = streams.writable.getWriter();
      await writer2.write(elementString.right);
      writer2.releaseLock();

      await streams.writable.close();
    });

    return streams.readable;
  }

  async hydrate(ctx: HydrateProps) {
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

    const hydratedNode = new HydratedNode({
      mount: () => {
        return () => {
          atoms.forEach((atom) => destroyAtom(atom));
          element.remove();
        };
      },
      parent: ctx.parentHydratedNode,
    });

    const {hydratedNodes} = await handleChildrenHydrate({
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

  async render(ctx: RenderProps) {
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

    const hydratedNode = new HydratedNode({
      mount: () => {
        return () => {
          atoms.forEach((atom) => destroyAtom(atom));
          element.remove();
        };
      },
      parent: ctx.parentHydratedNode,
    });

    ctx.dom.parent.appendChild(element);

    await handleChildrenRender({
      children: this.children,
      parentHydratedNode: hydratedNode,
      dom: {parent: element},
      globalCtx: ctx.globalCtx,
    });

    return {hydratedNode};
  }
}
