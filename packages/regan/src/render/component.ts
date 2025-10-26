import {ErrorGurard} from '../components/error-guard.tsx';
import {selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {createErrorRegan, ErrorHandler, ErrorRegan} from '../errors/errors.tsx';
import {createErrorComponent} from '../errors/helpers.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Child} from '../types.ts';
import {handleChildren, HandleChildrenResult} from './children.ts';
import {RenderTemplate, RenderTemplateComponent} from './template.types.ts';
import {RenderProps, RenderResult} from './types.ts';

export function renderComponent(
  this: JsxNodeComponent,
  props: RenderProps
): RenderResult {
  const contextEnt = selectContextEnt(this, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt,
    globalCtx: props.globalCtx,
  });
  this.segmentEnt = segmentEnt;

  const hNode = new HNodeComponent({
    segmentEnt,
    globalCtx: props.globalCtx,
  });
  segmentEnt.hNode = hNode;

  const componentCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: {
      ...this.systemProps,
      rawHNode: hNode,
    },
    state: new ComponentState(),
    children: this.children,
    stage: 'render',
    segmentEnt,
    contextEnt,
    areaCtx: props.areaCtx,
  });

  const renderTemplate: RenderTemplateComponent = {
    type: 'component',
    children: [] as RenderTemplate[],
    createHNode: () => {
      return hNode;
    },
  };

  let rawChidlren: Child;
  try {
    rawChidlren = this.component(this.props, componentCtx);
  } catch (error) {
    const errorRegan = createErrorRegan({
      error,
      place: 'component',
      segmentEnt,
    });
    throw errorRegan;
  }

  hNode.mounts = componentCtx.state.mounts;
  hNode.unmounts = componentCtx.state.unmounts;

  const children = normalizeChildren(rawChidlren);

  let handleChildrenResult: HandleChildrenResult;

  try {
    handleChildrenResult = handleChildren({
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
      });

      handleChildrenResult = handleChildren({
        children: [errorComponent],
        globalCtx: props.globalCtx,
        parentSegmentEnt: segmentEnt,
        areaCtx: props.areaCtx,
      });
    } else {
      throw errorRegan;
    }
  }

  renderTemplate.children = handleChildrenResult.renderTemplates;

  return {
    renderTemplate,
  };
}
