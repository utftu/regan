import {normalizeChildren} from '../jsx/jsx.ts';
import {selectContextEnt} from '../context/context.tsx';
import {JsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {StringifyProps, StringifyResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {
  handleChildrenString,
  HandleChildrenStringifyResult,
} from './children.ts';
import {createErrorComponent} from '../errors/helpers.ts';
import {createErrorRegan, ErrorHandler} from '../errors/errors.tsx';
import {ErrorGuard} from '../components/error-guard.tsx';
import {Child} from '../types.ts';

export function strigifyComponent(jsxNode: JsxNodeComponent, props: StringifyProps): StringifyResult {
  const contextEnt = selectContextEnt(jsxNode, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt,
    globalCtx: props.stringifyCtx.globalCtx,
  });

  jsxNode.segmentEnt = segmentEnt;

  const funcCtx = new Ctx({
    globalCtx: props.stringifyCtx.globalCtx,
    props: jsxNode.props,
    systemProps: jsxNode.systemProps,
    state: new ComponentState(),
    children: jsxNode.children,
    stage: 'string',
    segmentEnt,
    contextEnt,
    areaCtx: props.stringifyCtx.areaCtx,
  });

  let rawChildren: Child;
  try {
    rawChildren = jsxNode.component(jsxNode.props, funcCtx);
  } catch (error) {
    const myError = createErrorRegan({error, place: 'component', segmentEnt});
    throw myError;
  }

  const children = normalizeChildren(rawChildren);

  let handleChildrenResult: HandleChildrenStringifyResult;

  try {
    handleChildrenResult = handleChildrenString({
      children,
      stringifyCtx: props.stringifyCtx,
      parentSegmentEnt: segmentEnt,
      lastText: props.lastText,
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

      handleChildrenResult = handleChildrenString({
        children: [errorComponent],
        stringifyCtx: props.stringifyCtx,
        parentSegmentEnt: segmentEnt,
        lastText: props.lastText,
      });
    } else {
      throw errorRegan;
    }
  }

  return {
    text: handleChildrenResult.text,
    lastText: handleChildrenResult.lastText,
  };
}
