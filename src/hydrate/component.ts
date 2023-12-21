import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState, HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HydrateProps} from '../node/hydrate/hydrate.ts';
import {createSmartMount} from '../utils.ts';

export async function hydrateComponent(
  this: JSXNodeComponent,
  ctx: HydrateProps
) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const hNode = new HNode({
    jsxSegment,
    parent: ctx.parentHNode,
    globalCtx: ctx.globalCtx,
  });

  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
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
    parentHNode: hNode,
    children,
    dom: ctx.dom,
    globalCtx: ctx.globalCtx,
    hContext: ctx.hContext,
  });

  hNode.addChildren(hNodes);

  return {insertedCount, hNode};
}
