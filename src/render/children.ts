import {createErrorRegan} from '../errors/errors.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {RenderNode, RenderNodeText} from './node.ts';
import {RenderCtx} from './types.ts';

export type HandleChildrenResult = {
  renderNodes: RenderNode[];
};

export function handleChildren({
  children,
  parentSegmentEnt,
  renderCtx,
}: {
  children: SingleChild[];
  renderCtx: RenderCtx;
  parentSegmentEnt: SegmentEnt;
}): HandleChildrenResult {
  const renderNodes: RenderNode[] = [];

  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const renderNodeText: RenderNodeText = {
        type: 'text',
        text: childOrAtom.toString(),
        segmentEnt: parentSegmentEnt,
        globalCtx: renderCtx.globalCtx,
        mounts: [],
        unmounts: [],
        children: [],
      };

      renderNodes.push(renderNodeText);

      continue;
    }

    if (checkAllowedStructure(childOrAtom) === false) {
      throw createErrorRegan({
        error: `Invalid structura: ${childOrAtom}`,
        place: 'jsx',
        segmentEnt: parentSegmentEnt,
      });
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const {renderNode} = jsxNode.render({
      jsxSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      renderCtx,
    });
    renderNodes.push(renderNode);

    insertedJsxCount++;
  }

  return {renderNodes};
}
