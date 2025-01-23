import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenHydrate} from './children.ts';
import {HNodeElement} from '../h-node/element.ts';
import {defaultInsertedInfo} from '../consts.ts';
import {splitProps} from '../v/convert/convert.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {HydrateProps, HydrateResult} from './types.ts';
import {initStaticProps} from '../utils/props/static.ts';
import {initDynamicSubsribes} from '../utils/props/dynamic.ts';

export async function hydrateElement(
  this: JsxNodeElement,
  props: HydrateProps
): HydrateResult {
  props.parentWait.promiseControls.resolve(defaultInsertedInfo);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSystemEnt: props.parentSegmentEnt,
    unmounts: [],
    jsxNode: this,
  });

  const element = props.domPointer.parent.childNodes[
    props.domPointer.nodeCount
  ] as HTMLElement;

  const {dynamicProps, staticProps} = splitProps(
    this.props,
    props.hydrateCtx.treeAtomsSnapshot
  );

  const hNode = new HNodeElement(
    {
      globalClientCtx: props.globalClientCtx,
      parent: props.parentHNode,
      globalCtx: props.globalCtx,
      segmentEnt,
      contextEnt: props.parentContextEnt,
    },
    {
      element,
    }
  );

  initStaticProps(element, staticProps);

  initDynamicSubsribes({
    hNode,
    dynamicProps,
  });

  const {hNodes} = await handleChildrenHydrate({
    parentInsertedDomNodesPromise: props.parentWait,
    children: this.children,
    parentDomPointer: {
      parent: element,
      nodeCount: 0,
    },
    parentHNode: hNode,
    globalCtx: props.globalCtx,
    hydrateCtx: props.hydrateCtx,
    globalClientCtx: props.globalClientCtx,
    parentSegmentEnt: segmentEnt,
    parentContextEnt: props.parentContextEnt,
  });

  hNode.addChildren(hNodes);

  return {
    hNode,
  };
}
