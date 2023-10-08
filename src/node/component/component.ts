import {normalizeChildren} from '../../jsx/jsx.ts';
import {NodeCtx, Props} from '../../types.ts';
import {Ctx} from '../ctx/ctx.ts';
import {HydratedNode, handleChildrenHydrate} from '../hydrate/hydrate.ts';
import {DomProps, FC, JSXNode, destroyAtom} from '../node.ts';
import {handleChildrenString} from '../string/string.ts';

export class JSXNodeComponent<TProps extends Props>
  extends JSXNode<FC<TProps>, TProps>
  implements JSXNode<FC<TProps>, TProps>
{
  async getStringStream(ctx: NodeCtx) {
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

  async hydrate(ctx: {dom: DomProps; parentHydratedNode?: HydratedNode}) {
    const state = {
      mounts: [],
      atoms: [],
    };
    const componentCtx = new Ctx({
      props: this.props,
      state: state,
      children: this.children,
    });
    const rawChidlren = await this.type(this.props, componentCtx);

    const children = normalizeChildren(rawChidlren);

    const hydratedNode = new HydratedNode({
      mount: () => {
        const unmounts = componentCtx.state.mounts.map((mount) => mount());

        return () => {
          unmounts.forEach((possibleUnmount) => {
            if (typeof possibleUnmount === 'function') {
              possibleUnmount();
            }
          });
          componentCtx.state.atoms.forEach((possibleAtom) => {
            if (possibleAtom instanceof Promise) {
              possibleAtom.then((atom) => destroyAtom(atom));
            } else {
              destroyAtom(possibleAtom);
            }
          });
        };
      },
      parent: ctx.parentHydratedNode,
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
}
