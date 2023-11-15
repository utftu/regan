import {createHydrateNodeComponent} from '../hydrate/component.ts';
import {ComponentState} from '../hydrate/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {RenderProps} from '../node/node.ts';
import {handleChildrenRender} from './children.ts';

export async function renderComponent(
  this: JSXNodeComponent,
  ctx: RenderProps
) {
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
