import {handleChildren, HandleChildrenResult} from './children.ts';
import {HNodeElement} from '../h-node/element.ts';
import {VOldElement} from '../v/types.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {RenderProps, RenderResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {initDynamicPropsStage0, splitProps} from '../utils/props.ts';
import {LisneterManager} from '../utils/listeners.ts';
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
    globalCtx: props.globalCtx,
  });
  this.segmentEnt = segmentEnt;

  const {dynamicProps, joinedProps} = splitProps(this.props);

  const listenerManager = new LisneterManager(segmentEnt);

  const initDynamicPropsStage1 = initDynamicPropsStage0({
    dynamicProps,
    globalCtx: props.globalCtx,
    areaCtx: props.areaCtx,
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
    globalCtx: props.globalCtx,
    parentSegmentEnt: segmentEnt,
    areaCtx: props.areaCtx,
  });

  renderTemplate.children = handleChildrenRenderResult.renderTemplates;

  return {
    renderTemplate,
  };
}
