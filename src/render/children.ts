import {createErrorRegan} from '../errors/errors.tsx';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';
import {checkClassChild} from '../utils/check-parent.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {createMatcher} from './align.ts';
import {RenderNode, RenderNodeText} from './node.ts';
import {RenderCtx} from './types.ts';

export type HandleChildrenResult = {
  renderNodes: RenderNode[];
};

// Компонент с ключом, который никуда не делся, не запускаем заново:
// его поддерево вместе с замыканиями и подписками остаётся жить.
// Пропы у него, соответственно, заморожены на первом рендере.
const checkKeep = (jsxNode: JsxNode, oldHNode?: HNode) => {
  if (!oldHNode || jsxNode.systemProps.key === undefined) {
    return false;
  }

  if (checkClassChild(jsxNode, 'jsxNodeComponent') === false) {
    return false;
  }

  const oldJsxNode = oldHNode.segmentEnt?.jsxNode;

  if (checkClassChild(oldJsxNode, 'jsxNodeComponent') === false) {
    return false;
  }

  return (
    (oldJsxNode as JsxNodeComponent).component ===
    (jsxNode as JsxNodeComponent).component
  );
};

export function handleChildren({
  children,
  parentSegmentEnt,
  renderCtx,
  oldHNodes = [],
}: {
  children: SingleChild[];
  renderCtx: RenderCtx;
  parentSegmentEnt: SegmentEnt;
  oldHNodes?: HNode[];
}): HandleChildrenResult {
  const renderNodes: RenderNode[] = [];
  const match = createMatcher(oldHNodes);

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
        oldHNode: match(),
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
    const oldHNode = match(jsxNode);

    if (checkKeep(jsxNode, oldHNode)) {
      // поддерево не трогаем, но место в дереве у него новое —
      // сегмент переподвешиваем, иначе getJsxPath начнёт врать
      const keptSegmentEnt = oldHNode!.segmentEnt;
      keptSegmentEnt.parentSegmentEnt = parentSegmentEnt;
      keptSegmentEnt.pathSegment.name = insertedJsxCount.toString();

      renderNodes.push({type: 'keep', oldHNode: oldHNode!});
      insertedJsxCount++;

      continue;
    }

    const {renderNode} = jsxNode.render({
      jsxSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      renderCtx,
      oldHNode,
    });
    renderNodes.push(renderNode);

    insertedJsxCount++;
  }

  return {renderNodes};
}
