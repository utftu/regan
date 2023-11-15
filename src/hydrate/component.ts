import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {HydrateProps, destroyAtom} from '../node/node.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState, HNode} from './h-node.ts';

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

export async function hydrateComponent(
  this: JSXNodeComponent,
  ctx: HydrateProps
) {
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
