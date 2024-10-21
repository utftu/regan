import {ComponentState, HNodeBase} from '../h-node/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenRender} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {
  RenderProps,
  RenderResult,
  RenderTemplate,
  RenderTemplateComponent,
} from './types.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {getContextValue} from '../context/context.tsx';
import {errorContext} from '../errors/errors.tsx';
import {HNodeComponent} from '../h-node/component.ts';
// import {RenderResult} from '../node/node.ts';

export async function renderComponent(
  this: JsxNodeComponent,
  ctx: RenderProps
): RenderResult {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentWrapper);
  const hNode = new HNodeComponent(
    {
      // parent: ctx.parentHNode,
      jsxSegment,
      globalCtx: ctx.globalCtx,
      hNodeCtx: ctx.hNodeCtx,
    },
    {ctx: null as any}
  );
  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    jsxSegment,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    hNode,
    jsxNodeComponent: this,
    parentCtx: ctx.parentCtx,
    stage: 'render',
  });
  hNode.ctx = componentCtx;

  const renderTemplate = {
    type: 'component',
    hNode,
    children: [] as RenderTemplate[],
  } satisfies RenderTemplateComponent;

  let rawChidlren;
  try {
    rawChidlren = await this.type(this.props, componentCtx);
  } catch (error) {
    const errorHandlers = getContextValue(errorContext, ctx.parentCtx);

    return new JsxNodeComponent({
      type: errorHandlers.errorJsx,
      props: {
        error,
        jsxNode: this,
      },
      systemProps: {},
      children: [],
    }).render(ctx);
  }

  const children = normalizeChildren(rawChidlren);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);
  hNode.unmounts.push(...componentCtx.state.unmounts);

  const {renderTemplates} = await handleChildrenRender({
    parentHNode: hNode,
    // parentPosition: ctx.parentPosition,
    children,
    globalCtx: ctx.globalCtx,
    parentJsxSegment: jsxSegment,
    renderCtx: ctx.renderCtx,
    hNodeCtx: ctx.hNodeCtx,
    parentCtx: componentCtx,
    // parentWait: ctx.parentWait,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplate,
  };
}
