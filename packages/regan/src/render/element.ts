import {handleChildren, HandleChildrenResult} from './children.ts';
import {HNodeElement} from '../h-node/element.ts';
import {VOldElement} from '../v/types.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {RenderProps, RenderResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {initDynamicPropsStage0, splitProps} from '../utils/props.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {RenderTemplateElement} from './template.types.ts';

export function renderElement(
  this: JsxNodeElement,
  props: RenderProps
): RenderResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt: props.parentSegmentEnt?.contextEnt,
    globalCtx: props.renderCtx.globalCtx,
  });
  this.segmentEnt = segmentEnt;

  const {dynamicProps, joinedProps} = splitProps(this.props);

  const listenerManager = new ListenerManager(segmentEnt);

  const initDynamicPropsStage1 = initDynamicPropsStage0({
    dynamicProps,
    globalCtx: props.renderCtx.globalCtx,
    areaCtx: props.renderCtx.areaCtx,
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
          globalCtx: props.renderCtx.globalCtx,
        },
        {
          element,
          listenerManager,
        }
      );
      segmentEnt.hNode = hNode;

      initDynamicPropsStage1(hNode, listenerManager);

      return hNode;
    },
    children: [],
  };

  let handleChildrenRenderResult: HandleChildrenResult = handleChildren({
    children: this.children,
    renderCtx: props.renderCtx,
    parentSegmentEnt: segmentEnt,
  });

  renderTemplate.children = handleChildrenRenderResult.renderTemplates;

  return {
    renderTemplate,
  };
}
