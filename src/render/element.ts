import {JsxNodeElement} from '../jsx-node/jsx-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {MountUnmounFunc} from '../h-node/h-node.ts';
import {HNodeElement} from '../h-node/element.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {splitProps, subscribeDynamicProps} from '../utils/props.ts';
import {applyRef} from '../utils/ref.ts';
import {handleChildren} from './children.ts';
import {RenderNodeElement} from './node.ts';
import {RenderProps, RenderResult} from './types.ts';

export function renderElement(jsxNode: JsxNodeElement, props: RenderProps): RenderResult {
  const segmentEnt = new SegmentEnt({
    name: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt: props.parentSegmentEnt?.contextEnt,
    globalCtx: props.globalCtx,
  });
  jsxNode.segmentEnt = segmentEnt;

  const {ref, rawHtml} = jsxNode.systemProps;
  const {dynamicProps, joinedProps} = splitProps(jsxNode.props);
  const listenerManager = new ListenerManager(segmentEnt);

  const mounts: MountUnmounFunc[] = [];
  const unmounts: MountUnmounFunc[] = [];

  subscribeDynamicProps({
    dynamicProps,
    mounts,
    globalCtx: props.globalCtx,
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
    tag: jsxNode.tagName,
    props: joinedProps,
    rawHtml,
    listenerManager,
    segmentEnt,
    globalCtx: props.globalCtx,
    mounts,
    unmounts,
    children: [],
    oldHNode: props.oldHNode,
  };

  renderNode.children = handleChildren({
    children: jsxNode.children,
    globalCtx: props.globalCtx,
        areaCtx: props.areaCtx,
    parentSegmentEnt: segmentEnt,
    oldHNodes: props.oldHNode?.children,
  }).renderNodes;

  return {renderNode};
}
