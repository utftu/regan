import {Atom} from 'strangelove';
import {normalizeChildren} from '../../jsx/jsx.ts';
import {FC, Props} from '../../types.ts';
import {Ctx} from '../ctx/ctx.ts';
import {
  ComponentState,
  HNode,
  handleChildrenHydrate,
} from '../hydrate/hydrate.ts';
import {
  GetStringStreamProps,
  HydrateProps,
  JSXNode,
  RenderProps,
  destroyAtom,
} from '../node.ts';
import {handleChildrenRender, redner} from '../render/render.ts';
import {handleChildrenString} from '../string/string.ts';
import {createAtomRegan} from '../../atoms/atoms.ts';
import {Fragment} from '../../components/fragment/fragment.ts';
import {getStringStreamComponent} from '../../string/component.ts';

// export function createHyedratedNodeFromAtom({
//   atom,
//   parentHydratedNode,
// }: {
//   atom: Atom;
//   parentHydratedNode?: HydratedNode;
// }) {
//   const childAtom = createAtomRegan(atom.get());
//   Atom.connect(atom, childAtom);

//   const hydratedNode = new HydratedNode({
//     mount() {
//       return () => {
//         destroyAtom(childAtom);
//         hydratedNode.children.forEach((child) => child.unmount());
//       };
//     },
//     parent: parentHydratedNode,
//   });

//   childAtom.exec = async (_, {data}) => {
//     const {hydratedNode: newHydratedNode} = await redner(
//       parentHydratedNode?.dom as any,
//       data instanceof JSXNode
//         ? data
//         : new JSXNodeComponent({
//             type: Fragment,
//             props: {},
//             key: '',
//             children: [data],
//           }),
//       {}
//     );
//     return true;
//   };
// }

export function createHydrateNodeComponent({
  ctx,
  parentHydratedNode,
}: {
  ctx: Ctx;
  parentHydratedNode?: HNode;
}) {
  return new HNode({
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

export class JSXNodeComponent<TProps extends Props = any>
  extends JSXNode<FC<TProps>, TProps>
  implements JSXNode<FC<TProps>, TProps>
{
  async getStringStream(ctx: GetStringStreamProps) {
    return getStringStreamComponent.call(this as JSXNodeComponent, ctx);

    const streams = new TransformStream<string, string>();

    const state = {
      mounts: [],
      atoms: [],
    };
    const rawChidlren = await this.type(
      this.props,
      new Ctx({
        jsxPath: ctx.jsxPath,
        props: this.props,
        state: state,
        children: this.children,
      })
    );

    const children = normalizeChildren(rawChidlren);

    Promise.resolve().then(async () => {
      await handleChildrenString({
        children,
        streams,
        jsxPath: ctx.jsxPath,
        globalCtx: ctx.globalCtx,
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
      jsxPath: ctx.jsxPath,
    });
    const rawChidlren = await this.type(this.props, componentCtx);

    const children = normalizeChildren(rawChidlren);

    const hydratedNode = createHydrateNodeComponent({
      ctx: componentCtx,
      parentHydratedNode: ctx.parentHydratedNode,
    });

    const {insertedCount, hydratedNodes: childrenHydrayedNodes} =
      await handleChildrenHydrate({
        jsxPath: ctx.jsxPath,
        parentHydratedNode: hydratedNode,
        children,
        dom: ctx.dom,
        globalCtx: ctx.globalCtx,
      });

    hydratedNode.addChildren(childrenHydrayedNodes);

    return {insertedCount, hydratedNode};
  }
  async render(ctx: RenderProps) {
    const componentCtx = new Ctx({
      jsxPath: ctx.jsxPath,
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
      jsxPath: ctx.jsxPath,
    });

    hydratedNode.addChildren(childrenHydrayedNodes);

    return {hydratedNode};
  }
}
