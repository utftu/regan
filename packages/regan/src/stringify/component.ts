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
import {ErrorGurard} from '../components/error-guard.tsx';
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
    globalCtx: props.globalCtx,
  });

  this.segmentEnt = segmentEnt;

  const funcCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    stage: 'string',
    segmentEnt,
    contextEnt,
    areaCtx: props.areaCtx,
  });

  let rawChidlren: Child;
  try {
    rawChidlren = this.component(this.props, funcCtx);
  } catch (error) {
    const myError = createErrorRegan({error, place: 'component', segmentEnt});
    throw myError;
  }

  const children = normalizeChildren(rawChidlren);

  let handleChildrenResult: HandleChildrenStringifyResult;

  try {
    handleChildrenResult = handleChildrenString({
      children,
      globalCtx: props.globalCtx,
      parentSegmentEnt: segmentEnt,
      areaCtx: props.areaCtx,
    });
  } catch (error) {
    const errorRegan = createErrorRegan({error, place: 'system', segmentEnt});
    if (this.component === ErrorGurard) {
      const errorHandler = this.props.handler as ErrorHandler;

      const errorComponent = createErrorComponent({
        error: errorRegan,
        errorHandler,
        segmentEnt,
      });

      handleChildrenResult = handleChildrenString({
        children: [errorComponent],
        globalCtx: props.globalCtx,
        parentSegmentEnt: segmentEnt,
        areaCtx: props.areaCtx,
      });
    } else {
      throw errorRegan;
    }
  }

  return {
    text: handleChildrenResult.text,
  };
}
