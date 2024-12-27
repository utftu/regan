import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenHydrate} from './children.ts';
import {HNodeElement} from '../h-node/element.ts';
import {defaultInsertedInfo} from '../consts.ts';
import {initDynamicSubsribes, initStaticProps} from '../utils/props/props.ts';
import {splitProps} from '../v/convert/convert.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {HydrateProps, HydrateResult} from './types.ts';

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
    props.domPointer.nodesCount
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
      // jsxNode: this,
    }
  );

  initStaticProps(element, staticProps);

  initDynamicSubsribes({
    hNode,
    dynamicProps,
    // changedAtoms: props.hydrateCtx.changedAtoms,
  });

  const {hNodes} = await handleChildrenHydrate({
    parentInsertedDomNodesPromise: props.parentWait,
    children: this.children,
    parentDomPointer: {
      parent: element,
      nodesCount: 0,
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
