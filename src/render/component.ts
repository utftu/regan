import {ComponentState, HNode} from '../h-node/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenRender} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {createSmartMount} from '../utils.ts';
import {RenderProps} from '../node/render/render.ts';

export async function renderComponent(
  this: JSXNodeComponent,
  ctx: RenderProps
) {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const hNode = new HNode({
    parent: ctx.parentHNode,
    jsxSegment,
    globalCtx: ctx.globalCtx,
    hNodeCtx: ctx.hNodeCtx,
  });
  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    jsxSegment,
    props: this.props,
    state: new ComponentState(),
    children: this.children,
    hNode,
  });

  const rawChidlren = await this.type(this.props, componentCtx);

  const children = normalizeChildren(rawChidlren);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);
  hNode.unmounts.push(...componentCtx.state.unmounts);

  const {hNodes} = await handleChildrenRender({
    parentHNode: hNode,
    children,
    globalCtx: ctx.globalCtx,
    parentJsxSegment: jsxSegment,
    addElementToParent: ctx.addElementToParent,
    renderCtx: ctx.renderCtx,
    hNodeCtx: ctx.hNodeCtx,
  });

  hNode.addChildren(hNodes);

  return {hNode};
}
