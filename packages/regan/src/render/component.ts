import {ComponentState} from '../h-node/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenRender} from './children.ts';
import {
  RenderProps,
  RenderResult,
  RenderTemplate,
  RenderTemplateComponent,
} from './types.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {
  ContextEnt,
  ContextProvider,
  getContextValue,
} from '../context/context.tsx';
import {errorContext} from '../errors/errors.tsx';
import {HNodeComponent} from '../h-node/component.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {SegmentComponent} from '../segments/component.ts';

export async function renderComponent(
  this: JsxNodeComponent,
  ctx: RenderProps
): RenderResult {
  let contextEnt: ContextEnt;
  if (this.type === ContextProvider) {
    contextEnt = {
      context: this.systemProps.context!,
      parent: ctx.parentContextEnt,
    };
  } else {
    contextEnt = ctx.parentContextEnt;
  }
  const segmentComponent = new SegmentComponent({
    parentSysyemComponent: ctx.parentSegmentComponent,
    children: [],
    unmounts: [],
    ctx: null as any,
  });
  const hNode = new HNodeComponent(
    {
      segmentEnt: new SegmentEnt({
        jsxSegmentName: ctx.jsxSegmentName,
        parentSystemEnt: ctx.parentSegmentEnt,
        unmounts: [],
        jsxNode: this,
      }),
      globalCtx: ctx.globalCtx,
      globalClientCtx: ctx.globalClientCtx,
      segmentComponent,
    },
    {
      segmentComponent: new SegmentComponent({
        parentSysyemComponent: ctx.parentSegmentComponent,
        children: [],
        unmounts: [],
        ctx: null as any,
      }),
    }
  );
  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    hNode,
    jsxNodeComponent: this,
    stage: 'render',
    segmentEnt: hNode.segmentEnt,
  });
  hNode.segmentComponentSure.ctx = componentCtx;

  const renderTemplate = {
    type: 'component',
    children: [] as RenderTemplate[],
    createHNode: () => {
      return hNode;
    },
    connectHNode({children}) {
      hNode.children = children;
      children.forEach((child) => {
        child.parent = hNode;
      });
    },
  } satisfies RenderTemplateComponent;

  let rawChidlren;
  try {
    rawChidlren = await this.type(this.props, componentCtx);
  } catch (error) {
    const errorHandlers = getContextValue(
      errorContext,
      ctx.parentSegmentComponent?.ctx
    );

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
    children,
    globalClientCtx: ctx.globalClientCtx,
    globalCtx: ctx.globalCtx,
    renderCtx: ctx.renderCtx,
    parentSegmentEnt: hNode.segmentEnt,
    parentSegmentComponent: hNode.segmentComponentSure,
    parentContextEnt: contextEnt,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplate,
  };
}
