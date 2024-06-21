import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState, HNodeBase} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HydrateProps, HydrateResult} from '../node/hydrate/hydrate.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {errorContext} from '../errors/errors.tsx';
import {getContextValue} from '../context/context.tsx';

export async function hydrateComponent(
  this: JsxNodeComponent,
  ctx: HydrateProps
): HydrateResult {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const hNode = new HNodeBase({
    hNodeCtx: ctx.hNodeCtx,
    jsxSegment,
    parent: ctx.parentHNode,
    globalCtx: ctx.globalCtx,
  });

  const componentCtx = new Ctx({
    client: {
      parentDomPointer: ctx.domPointer,
      hNode,
    },
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

  const smartMount = createSmartMount(componentCtx);
  hNode.unmounts = componentCtx.state.unmounts;
  hNode.mounts.push(smartMount);

  const children = normalizeChildren(rawChidlren);

  const {insertedDomNodes, hNodes} = await handleChildrenHydrate({
    insertedDomNodesPromise: ctx.insertedDomNodesPromise,
    hNodeCtx: ctx.hNodeCtx,
    parentJsxSegment: jsxSegment,
    parentHNode: hNode,
    parentCtx: componentCtx,
    children,
    parentDomPointer: ctx.domPointer,
    // dom: ctx.dom,
    globalCtx: ctx.globalCtx,
    hCtx: ctx.hCtx,
  });

  hNode.addChildren(hNodes);

  return {insertedDomNodes: insertedDomNodes, hNode};
}
