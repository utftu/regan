import {ErrorGuard} from '../components/error-guard.tsx';
import {selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {createErrorRegan, ErrorHandler} from '../errors/errors.tsx';
import {createErrorComponent} from '../errors/helpers.ts';
import {JsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Child} from '../types.ts';
import {handleChildren, HandleChildrenResult} from './children.ts';
import {RenderNodeComponent} from './node.ts';
import {RenderProps, RenderResult} from './types.ts';

export function renderComponent(jsxNode: JsxNodeComponent, props: RenderProps): RenderResult {
  const contextEnt = selectContextEnt(jsxNode, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt,
    globalCtx: props.renderCtx.globalCtx,
  });
  jsxNode.segmentEnt = segmentEnt;

  const componentCtx = new Ctx({
    globalCtx: props.renderCtx.globalCtx,
    props: jsxNode.props,
    systemProps: jsxNode.systemProps,
    state: new ComponentState(),
    children: jsxNode.children,
    stage: 'render',
    segmentEnt,
    contextEnt,
    areaCtx: props.renderCtx.areaCtx,
  });

  const renderNode: RenderNodeComponent = {
    type: 'component',
    segmentEnt,
    globalCtx: props.renderCtx.globalCtx,
    mounts: [],
    unmounts: [],
    children: [],
    oldHNode: props.oldHNode,
  };

  let rawChildren: Child;
  try {
    rawChildren = jsxNode.component(jsxNode.props, componentCtx);
  } catch (error) {
    const errorRegan = createErrorRegan({
      error,
      place: 'component',
      segmentEnt,
    });
    throw errorRegan;
  }

  renderNode.mounts = componentCtx.state.mounts;
  renderNode.unmounts = componentCtx.state.unmounts;

  const children = normalizeChildren(rawChildren);

  let handleChildrenResult: HandleChildrenResult;

  try {
    handleChildrenResult = handleChildren({
      children,
      parentSegmentEnt: segmentEnt,
      renderCtx: props.renderCtx,
      oldHNodes: props.oldHNode?.children,
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

      handleChildrenResult = handleChildren({
        children: [errorComponent],
        parentSegmentEnt: segmentEnt,
        renderCtx: props.renderCtx,
      });
    } else {
      throw errorRegan;
    }
  }

  renderNode.children = handleChildrenResult.renderNodes;

  return {
    renderNode,
  };
}
