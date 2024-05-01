import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState, HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HydrateProps} from '../node/hydrate/hydrate.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {errorContext} from '../errors/errors.tsx';
import {getContextValue} from '../context/context.tsx';
import {HydrateResult} from '../node/node.ts';

export async function hydrateComponent(
  this: JsxNodeComponent,
  ctx: HydrateProps
): HydrateResult {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const hNode = new HNode({
    hNodeCtx: ctx.hNodeCtx,
    jsxSegment,
    parent: ctx.parentHNode,
    globalCtx: ctx.globalCtx,
  });

  const componentCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    jsxSegment,
    hNode,
    jsxNodeComponent: this,
    parentCtx: ctx.parentCtx,
    stage: 'hydrate',
  });

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
    }).hydrate(ctx);
  }

  // const rawChidlren = await this.type(this.props, componentCtx);

  const smartMount = createSmartMount(componentCtx);
  hNode.unmounts = componentCtx.state.unmounts;
  hNode.mounts.push(smartMount);

  const children = normalizeChildren(rawChidlren);

  const {insertedCount, hNodes} = await handleChildrenHydrate({
    hNodeCtx: ctx.hNodeCtx,
    parentJsxSegment: jsxSegment,
    parentHNode: hNode,
    parentCtx: componentCtx,
    children,
    dom: ctx.dom,
    globalCtx: ctx.globalCtx,
    hCtx: ctx.hCtx,
  });

  hNode.addChildren(hNodes);

  return {insertedCount, hNode};
}
