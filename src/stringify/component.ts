import {normalizeChildren} from '../jsx/jsx.ts';
import {selectContextEnt} from '../context/context.tsx';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
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

export function strigifyComponent(
  this: JsxNodeComponent,
  props: StringifyProps
): StringifyResult {
  const contextEnt = selectContextEnt(this, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt,
    globalCtx: props.stringifyCtx.globalCtx,
  });

  this.segmentEnt = segmentEnt;

  const funcCtx = new Ctx({
    globalCtx: props.stringifyCtx.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    stage: 'string',
    segmentEnt,
    contextEnt,
    areaCtx: props.stringifyCtx.areaCtx,
  });

  let rawChildren: Child;
  try {
    rawChildren = this.component(this.props, funcCtx);
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
    });
  } catch (error) {
    const errorRegan = createErrorRegan({error, place: 'system', segmentEnt});
    if (this.component === ErrorGuard) {
      const errorHandler = this.props.handler as ErrorHandler;

      const errorComponent = createErrorComponent({
        error: errorRegan,
        errorHandler,
        segmentEnt,
      });

      handleChildrenResult = handleChildrenString({
        children: [errorComponent],
        stringifyCtx: props.stringifyCtx,
        parentSegmentEnt: segmentEnt,
      });
    } else {
      throw errorRegan;
    }
  }

  return {
    text: handleChildrenResult.text,
  };
}
