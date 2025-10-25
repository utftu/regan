import {ErrorGurard} from '../components/error-guard.tsx';
import {selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {ErrorHandler} from '../errors/errors.tsx';
import {createErrorComponent} from '../errors/helpers.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Props} from '../types.ts';
import {handleChildrenHydrate} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';

export function hydrateComponent(
  this: JsxNodeComponent,
  props: HydrateProps
): HydrateResult {
  const contextEnt = selectContextEnt(this, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt,
  });
  this.segmentEnt = segmentEnt;

  const hNode = new HNodeComponent({
    globalClientCtx: props.globalClientCtx,
    parent: props.parentHNode,
    globalCtx: props.globalCtx,
    segmentEnt,
  });
  segmentEnt.hNode = hNode;

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
    contextEnt: contextEnt,
    areaCtx: props.areaCtx,
  });

  const rawChidlren = this.component(this.props, componentCtx);

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
      globalClientCtx: props.globalClientCtx,
      lastText: props.lastText,
    });
  } catch (error) {
    if (this.component === ErrorGurard) {
      const errorHandler = this.props.handler as ErrorHandler;

      const errorComponent = createErrorComponent({
        error,
        segmentEnt,
        errorHandler,
      });

      resultHandlerChildren = handleChildrenHydrate({
        children: [errorComponent],
        parentHNode: hNode,
        globalCtx: props.globalCtx,
        hydrateCtx: props.hydrateCtx,
        parentDomPointer: props.domPointer,
        parentSegmentEnt: segmentEnt,
        globalClientCtx: props.globalClientCtx,
        lastText: props.lastText,
      });
    } else {
      throw error;
    }
  }

  hNode.addChildren(resultHandlerChildren.hNodes);

  return {
    hNode,
    nodeCount: resultHandlerChildren.nodeCount,
    lastText: resultHandlerChildren.lastText,
  };
}
