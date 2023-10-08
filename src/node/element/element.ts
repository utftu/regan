import {NodeCtx, Props} from '../../types.ts';
import {HydratedNode, handleChildrenHydrate} from '../hydrate/hydrate.ts';
import {DomProps, JSXNode} from '../node.ts';
import {createElementString, handleChildrenString} from '../string/string.ts';

export class JSXNodeElement<TProps extends Props>
  extends JSXNode<string, TProps>
  implements JSXNode<string, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();

    const elementString = createElementString({
      type: this.type,
      props: this.props,
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

      const writer2 = streams.writable.getWriter();
      await writer2.write(elementString.right);
      writer2.releaseLock();

      await streams.writable.close();
    });

    return streams.readable;
  }

  async hydrate(ctx: {dom: DomProps; parentHydratedNode?: HydratedNode}) {
    const element = ctx.dom.parent.children[ctx.dom.position] as HTMLElement;

    for (const key in this.props) {
      const prop = this.props[key];

      if (typeof prop !== 'function') {
        continue;
      }

      // todo get atom

      element.addEventListener(key, prop);
    }

    const hydratedNode = new HydratedNode({
      mount: () => {
        return () => {
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
    });

    hydratedNode.addChildren(hydratedNodes);

    return {insertedCount: 1, hydratedNode};
  }
}
