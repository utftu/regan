import {handleChildren, HandleChildrenResult} from './children.ts';
import {HNodeElement} from '../h-node/element.ts';
import {VOldElement} from '../v/types.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {RenderProps, RenderResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {initDynamicPropsStage0, splitProps} from '../utils/props.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {RenderTemplateElement} from './template.types.ts';
import {createErrorJsxNodeComponent} from '../errors/helpers.ts';

export function renderElement(
  this: JsxNodeElement,
  props: RenderProps
): RenderResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt: props.parentSegmentEnt?.contextEnt,
  });

  const {dynamicProps, joinedProps} = splitProps(this.props);

  const listenerManager = new LisneterManager(segmentEnt);

  const initDynamicPropsStage1 = initDynamicPropsStage0({
    dynamicProps,
    atomsTracker: props.renderCtx.atomsTracker,
  });

  // create render template
  const renderTemplate: RenderTemplateElement = {
    type: 'element',
    vNew: {
      type: 'element',
      data: {
        tag: this.tagName,
        props: joinedProps,
      },
      children: [],
      listenerManager,
    },
    createHNode: (vOld: VOldElement) => {
      const element = vOld.element;
      const hNode = new HNodeElement(
        {
          segmentEnt,
          globalCtx: props.globalCtx,
          globalClientCtx: props.globalClientCtx,
        },
        {
          element,
          listenerManager,
        }
      );

      initDynamicPropsStage1(hNode, listenerManager);

      return hNode;
    },
    children: [],
  };

  let handleChildrenRenderResult: HandleChildrenResult;

  try {
    handleChildrenRenderResult = handleChildren({
      children: this.children,
      globalCtx: props.globalCtx,
      renderCtx: props.renderCtx,
      globalClientCtx: props.globalClientCtx,
      parentSegmentEnt: segmentEnt,
    });
  } catch (error) {
    console.log('-----', 'error element', error);
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentSegmentEnt?.contextEnt
    );

    return jsxNodeComponent.render(props);
  }

  renderTemplate.children = handleChildrenRenderResult.renderTemplates;

  return {
    renderTemplate,
  };
}
