import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {HydrateProps, destroyAtom} from '../node/node.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState, HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';

const createSmartMount = (ctx: Ctx) => (hNode: HNode) => {
  const unmounts = ctx.state.mounts.map((mount) => mount());

  hNode.unmounts.push(() => {
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
  });
};

export async function hydrateComponent(
  this: JSXNodeComponent,
  ctx: HydrateProps
) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const hNode = new HNode({
    jsxSegment,
    parent: ctx.parentHydratedNode,
  });

  const componentCtx = new Ctx({
    props: this.props,
    state: new ComponentState(),
    children: this.children,
    jsxSegment,
    hNode,
  });

  const rawChidlren = await this.type(this.props, componentCtx);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);

  const children = normalizeChildren(rawChidlren);

  const {insertedCount, hNodes} = await handleChildrenHydrate({
    parentJsxSegment: jsxSegment,
    parentHydratedNode: hNode,
    children,
    dom: ctx.dom,
    globalCtx: ctx.globalCtx,
  });

  hNode.addChildren(hNodes);

  return {insertedCount, hNode};
}
