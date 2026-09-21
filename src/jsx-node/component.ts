import {ErrorGuard} from '../components/error-guard.tsx';
import {ContextEnt, selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx, Stage} from '../ctx/ctx.ts';
import {createErrorRegan, ErrorHandler} from '../errors/errors.ts';
import {createErrorComponent} from '../errors/handle.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild, StageProps} from '../types.ts';
import {JsxNodeComponent} from './jsx-node.ts';
import {GlobalCtxBoth} from '../ctx/global.ts';

// Запуск компонента — один на все три стадии.
//
// Стадии отличаются только тем, что строят после: RenderNode, HNode или
// строку. А контекст, сегмент, Ctx, вызов тела и перехват падения у них
// одинаковые — и пока это жило в трёх копиях, копии успели разойтись.

export function runComponent({
  jsxNode,
  props,
  stage,
}: {
  jsxNode: JsxNodeComponent;
  props: StageProps<GlobalCtxBoth>;
  stage: Stage;
}): {
  segmentEnt: SegmentEnt;
  contextEnt: ContextEnt | undefined;
  state: ComponentState;
  children: SingleChild[];
} {
  const contextEnt = selectContextEnt(
    jsxNode,
    props.parentSegmentEnt?.contextEnt,
  );

  const segmentEnt = new SegmentEnt({
    name: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt,
    globalCtx: props.globalCtx,
  });
  jsxNode.segmentEnt = segmentEnt;

  const state = new ComponentState();

  const ctx = new Ctx({
    globalCtx: props.globalCtx,
    areaCtx: props.areaCtx,
    props: jsxNode.props,
    systemProps: jsxNode.systemProps,
    children: jsxNode.children,
    state,
    stage,
    segmentEnt,
    contextEnt,
  });

  let rawChildren;

  try {
    rawChildren = jsxNode.component(jsxNode.props, ctx);
  } catch (error) {
    throw createErrorRegan({error, place: 'component', segmentEnt});
  }

  return {
    segmentEnt,
    contextEnt,
    state,
    children: normalizeChildren(rawChildren),
  };
}

// Ошибка, случившаяся при разборе детей: если это ErrorGuard — отдаём
// вместо детей его запасную разметку, иначе пробрасываем дальше.
// Только решает, чем заменить; повторный разбор делает стадия.
export function getErrorGuardChildren({
  error,
  jsxNode,
  segmentEnt,
}: {
  error: unknown;
  jsxNode: JsxNodeComponent;
  segmentEnt: SegmentEnt;
}): SingleChild[] {
  const errorRegan = createErrorRegan({error, place: 'system', segmentEnt});

  if (jsxNode.component !== ErrorGuard) {
    throw errorRegan;
  }

  return [
    createErrorComponent({
      error: errorRegan,
      errorHandler: jsxNode.props.handler as ErrorHandler,
      segmentEnt,
    }),
  ];
}
