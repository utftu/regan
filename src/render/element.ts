import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {MountUnmounFunc} from '../h-node/h-node.ts';
import {HNodeElement} from '../h-node/element.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {splitProps, subscribeDynamicProps} from '../utils/props.ts';
import {applyRef} from '../utils/ref.ts';
import {handleChildren} from './children.ts';
import {RenderNodeElement} from './node.ts';
import {RenderProps, RenderResult} from './types.ts';

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

  const {ref, rawHtml} = this.systemProps;
  const {dynamicProps, joinedProps} = splitProps(this.props);
  const listenerManager = new ListenerManager(segmentEnt);

  const mounts: MountUnmounFunc[] = [];
  const unmounts: MountUnmounFunc[] = [];

  subscribeDynamicProps({
    dynamicProps,
    mounts,
    globalCtx: props.renderCtx.globalCtx,
    listenerManager,
  });

  if (ref) {
    mounts.push((hNode) => {
      applyRef(ref, (hNode as HNodeElement).element);
    });
    unmounts.push(() => {
      applyRef(ref, undefined);
    });
  }

  const renderNode: RenderNodeElement = {
    type: 'element',
    tag: this.tagName,
    props: joinedProps,
    rawHtml,
    listenerManager,
    segmentEnt,
    globalCtx: props.renderCtx.globalCtx,
    mounts,
    unmounts,
    children: [],
    oldHNode: props.oldHNode,
  };

  renderNode.children = handleChildren({
    children: this.children,
    renderCtx: props.renderCtx,
    parentSegmentEnt: segmentEnt,
    oldHNodes: props.oldHNode?.children,
  }).renderNodes;

  return {renderNode};
}
