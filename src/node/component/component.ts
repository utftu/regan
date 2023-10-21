import {normalizeChildren} from '../../jsx/jsx.ts';
import {Props} from '../../types.ts';
import {Ctx} from '../ctx/ctx.ts';
import {
  ComponentState,
  HydratedNode,
  handleChildrenHydrate,
} from '../hydrate/hydrate.ts';
import {
  FC,
  GetStringStreamProps,
  HydrateProps,
  JSXNode,
  RenderProps,
  destroyAtom,
} from '../node.ts';
import {handleChildrenRender} from '../render/render.ts';
import {handleChildrenString} from '../string/string.ts';

export function createHydrateNodeComponent({
  ctx,
  parentHydratedNode,
}: {
  ctx: Ctx;
  parentHydratedNode?: HydratedNode;
}) {
  return new HydratedNode({
    mount: () => {
      const unmounts = ctx.state.mounts.map((mount) => mount());

      return () => {
        unmounts.forEach((possibleUnmount) => {
          if (typeof possibleUnmount === 'function') {
            possibleUnmount();
          }
        });
        ctx.state.atoms.forEach((possibleAtom) => {
          if (possibleAtom instanceof Promise) {
            possibleAtom.then((atom) => destroyAtom(atom));
          } else {
            destroyAtom(possibleAtom);
          }
        });
      };
    },
    parent: parentHydratedNode,
  });
}

export class JSXNodeComponent<TProps extends Props>
  extends JSXNode<FC<TProps>, TProps>
  implements JSXNode<FC<TProps>, TProps>
{
  async getStringStream(ctx: GetStringStreamProps) {
    const streams = new TransformStream<string, string>();

    const state = {
      mounts: [],
      atoms: [],
    };
    const rawChidlren = await this.type(
      this.props,
      new Ctx({
        props: this.props,
        state: state,
        children: this.children,
      })
    );

    const children = normalizeChildren(rawChidlren);

    Promise.resolve().then(async () => {
      await handleChildrenString({
        children,
        ctx,
        streams,
      });
      await streams.writable.close();
    });

    return streams.readable;
  }

  async hydrate(ctx: HydrateProps) {
    const componentCtx = new Ctx({
      props: this.props,
      state: new ComponentState(),
      children: this.children,
    });
    const rawChidlren = await this.type(this.props, componentCtx);

    const children = normalizeChildren(rawChidlren);

    const hydratedNode = createHydrateNodeComponent({
      ctx: componentCtx,
      parentHydratedNode: ctx.parentHydratedNode,
    });

    const {insertedCount, hydratedNodes: childrenHydrayedNodes} =
      await handleChildrenHydrate({
        parentHydratedNode: hydratedNode,
        children,
        dom: ctx.dom,
      });

    hydratedNode.addChildren(childrenHydrayedNodes);

    return {insertedCount, hydratedNode};
  }
  async render(ctx: RenderProps) {
    const componentCtx = new Ctx({
      props: this.props,
      state: new ComponentState(),
      children: this.children,
    });
    const rawChidlren = await this.type(this.props, componentCtx);

    const children = normalizeChildren(rawChidlren);

    const hydratedNode = createHydrateNodeComponent({
      ctx: componentCtx,
      parentHydratedNode: ctx.parentHydratedNode,
    });

    const {hydratedNodes: childrenHydrayedNodes} = await handleChildrenRender({
      parentHydratedNode: hydratedNode,
      children,
      dom: ctx.dom,
      globalCtx: ctx.globalCtx,
    });

    hydratedNode.addChildren(childrenHydrayedNodes);

    return {hydratedNode};
  }
}
