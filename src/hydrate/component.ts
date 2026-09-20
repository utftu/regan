import {ErrorGuard} from '../components/error-guard.tsx';
import {selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {createErrorRegan, ErrorHandler} from '../errors/errors.tsx';
import {createErrorComponent} from '../errors/helpers.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {JsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Child} from '../types.ts';
import {handleChildrenHydrate} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';

export function hydrateComponent(jsxNode: JsxNodeComponent, props: HydrateProps): HydrateResult {
  const contextEnt = selectContextEnt(jsxNode, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt,
    globalCtx: props.globalCtx,
  });
  jsxNode.segmentEnt = segmentEnt;

  const hNode = new HNodeComponent({
    parent: props.parentHNode,
    globalCtx: props.globalCtx,
    segmentEnt,
  });
  segmentEnt.hNode = hNode;

  const componentCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: jsxNode.props,
    systemProps: jsxNode.systemProps,
    state: new ComponentState(),
    children: jsxNode.children,
    segmentEnt: hNode.segmentEnt,
    stage: 'hydrate',
    contextEnt: contextEnt,
    areaCtx: props.areaCtx,
  });

  let rawChildren: Child;
  try {
    rawChildren = jsxNode.component(jsxNode.props, componentCtx);
  } catch (error) {
    const myError = createErrorRegan({error, place: 'component', segmentEnt});
    throw myError;
  }

  hNode.mounts = componentCtx.state.mounts;
  hNode.unmounts = componentCtx.state.unmounts;

  const children = normalizeChildren(rawChildren);

  let resultHandlerChildren;

  try {
    resultHandlerChildren = handleChildrenHydrate({
      children,
      parentHNode: hNode,
      globalCtx: props.globalCtx,
      parentDomPointer: props.domPointer,
      parentSegmentEnt: segmentEnt,
      areaCtx: props.areaCtx,
    });
  } catch (error) {
    const errorRegan = createErrorRegan({error, place: 'system', segmentEnt});
    if (jsxNode.component === ErrorGuard) {
      const errorHandler = jsxNode.props.handler as ErrorHandler;

      const errorComponent = createErrorComponent({
        error: errorRegan,
        errorHandler,
        segmentEnt,
      });

      resultHandlerChildren = handleChildrenHydrate({
        children: [errorComponent],
        parentHNode: hNode,
        globalCtx: props.globalCtx,
        parentDomPointer: props.domPointer,
        parentSegmentEnt: segmentEnt,
        areaCtx: props.areaCtx,
      });
    } else {
      throw errorRegan;
    }
  }

  hNode.addChildren(resultHandlerChildren.hNodes);

  return {
    hNode,
    nodeCount: resultHandlerChildren.nodeCount,
  };
}
