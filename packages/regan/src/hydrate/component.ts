import {selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {createErrorJsxNodeComponent} from '../errors/helpers.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Props} from '../types.ts';
import {handleChildrenHydrate} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';

export function hydrateComponent<TProps extends Props>(
  this: JsxNodeComponent<TProps>,
  props: HydrateProps
): HydrateResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    parentContextEnt: props.parentContextEnt,
  });

  const hNode = new HNodeComponent({
    globalClientCtx: props.globalClientCtx,
    parent: props.parentHNode,
    globalCtx: props.globalCtx,
    segmentEnt,
  });

  const componentCtx = new Ctx({
    client: {
      parentDomPointer: props.domPointer,
      hNode,
    },
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: {...this.systemProps, rawHNode: hNode},
    state: new ComponentState(),
    children: this.children,
    segmentEnt: hNode.segmentEnt,
    stage: 'hydrate',
    parentContextEnt: props.parentContextEnt,
  });

  let rawChidlren;
  try {
    rawChidlren = this.component(this.props, componentCtx);
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentContextEnt
    );

    return jsxNodeComponent.hydrate(props);
  }

  const contextEnt = selectContextEnt(this, props.parentContextEnt);

  hNode.mounts = componentCtx.state.mounts;
  hNode.unmounts = componentCtx.state.unmounts;

  const children = normalizeChildren(rawChidlren);

  let resultHandlerChildren;

  try {
    resultHandlerChildren = handleChildrenHydrate({
      children,
      parentHNode: hNode,
      globalCtx: props.globalCtx,
      hydrateCtx: props.hydrateCtx,
      parentDomPointer: props.domPointer,
      parentSegmentEnt: segmentEnt,
      parentContextEnt: contextEnt,
      globalClientCtx: props.globalClientCtx,
    });
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentContextEnt
    );

    return jsxNodeComponent.hydrate(props);
  }

  hNode.addChildren(resultHandlerChildren.hNodes);

  return {
    hNode,
    elementsCount: resultHandlerChildren.elementsCount,
  };
}
