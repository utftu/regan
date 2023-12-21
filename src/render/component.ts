// import {createHydrateNodeComponent} from '../hydrate/component.ts';
import {ComponentState, HNode} from '../h-node/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {RenderProps} from '../node/node.ts';
import {handleChildrenRender} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {createSmartMount} from '../utils.ts';

export async function renderComponent(
  this: JSXNodeComponent,
  ctx: RenderProps
) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const hNode = new HNode({
    parent: ctx.parentHNode,
    jsxSegment,
    globalCtx: ctx.globalCtx,
  });
  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    jsxSegment,
    props: this.props,
    state: new ComponentState(),
    children: this.children,
  });
  const rawChidlren = await this.type(this.props, componentCtx);

  const children = normalizeChildren(rawChidlren);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);

  const {hNodes} = await handleChildrenRender({
    parentHNode: hNode,
    children,
    dom: ctx.dom,
    globalCtx: ctx.globalCtx,
    parentJsxSegment: jsxSegment,
    addElementToParent: ctx.addElementToParent,
    renderCtx: ctx.renderCtx,
  });

  hNode.addChildren(hNodes);

  return {hNode};
}
