import {ErrorGurard} from '../components/error-guard.tsx';
import {selectContextEnt} from '../context/context.tsx';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {ErrorHandler} from '../errors/errors.tsx';
import {createErrorComponent} from '../errors/helpers.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
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
  });
  this.segmentEnt = segmentEnt;

  const hNode = new HNodeComponent({
    segmentEnt,
    globalCtx: props.globalCtx,
    globalClientCtx: props.globalClientCtx,
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
  });

  const renderTemplate: RenderTemplateComponent = {
    type: 'component',
    children: [] as RenderTemplate[],
    createHNode: () => {
      return hNode;
    },
  };

  const rawChidlren = this.component(this.props, componentCtx);

  hNode.mounts = componentCtx.state.mounts;
  hNode.unmounts = componentCtx.state.unmounts;

  const children = normalizeChildren(rawChidlren);

  let handleChildrenResult: HandleChildrenResult;

  try {
    handleChildrenResult = handleChildren({
      children,
      globalClientCtx: props.globalClientCtx,
      globalCtx: props.globalCtx,
      renderCtx: props.renderCtx,
      parentSegmentEnt: segmentEnt,
    });
  } catch (error) {
    if (this.component === ErrorGurard) {
      const errorHandler = this.props.handler as ErrorHandler;

      const errorComponent = createErrorComponent({
        error,
        segmentEnt,
        errorHandler,
      });

      handleChildrenResult = handleChildren({
        children: [errorComponent],
        globalClientCtx: props.globalClientCtx,
        globalCtx: props.globalCtx,
        renderCtx: props.renderCtx,
        parentSegmentEnt: segmentEnt,
      });
    } else {
      throw error;
    }
  }

  renderTemplate.children = handleChildrenResult.renderTemplates;

  return {
    renderTemplate,
  };
}
