import {createErrorRegan} from '../errors/errors.tsx';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild, DomPointer} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {commentNodeType} from '../consts.ts';

export type HandleChildrenHydrateResult = {
  hNodes: HNode[];
  nodeCount: number;
};

// stringify ставит разделитель между соседними текстами, иначе браузер
// склеит их в один узел. Своё дело он сделал при парсинге — убираем,
// чтобы дерево совпадало с тем, что даёт клиентский рендер.
const removeTextSeparator = (
  parent: ParentNode | Document,
  index: number,
): void => {
  const node = parent.childNodes[index];

  if (node && node.nodeType === commentNodeType && node.nodeValue === '') {
    (node as ChildNode).remove();
  }
};

export function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  parentDomPointer,
  parentSegmentEnt,
  areaCtx: areaCtx,
}: {
  children: SingleChild[];
  parentHNode: HNode;
  globalCtx: GlobalCtx;
  parentDomPointer: DomPointer;
  parentSegmentEnt: SegmentEnt;
  areaCtx: AreaCtx;
}): HandleChildrenHydrateResult {
  const hNodes: HNode[] = [];
  const nodeCountInit = parentDomPointer.nodeCount;
  let nodeCount = nodeCountInit;

  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      const textNode = parentDomPointer.parent.childNodes[nodeCount] as Text;

      const textHNode = new HNodeText(
        {
          parent: parentHNode,
          globalCtx,
          segmentEnt: parentSegmentEnt,
        },
        {
          text: text,
          textNode: textNode as Text,
        },
      );

      hNodes.push(textHNode);

      nodeCount++;
      removeTextSeparator(parentDomPointer.parent, nodeCount);

      continue;
    }

    if (checkAllowedStructure(childOrAtom) === false) {
      const errorRegan = createErrorRegan({
        error: `Invalid structura: ${childOrAtom}`,
        place: 'jsx',
        segmentEnt: parentSegmentEnt,
      });

      throw errorRegan;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const hydrateResult = jsxNode.hydrate({
      jsxSegmentName: `${insertedJsxCount}`,
      parentSegmentEnt,
      domPointer: {
        parent: parentDomPointer.parent,
        nodeCount,
      },
      parentHNode,
      globalCtx,
      areaCtx,
    });
    hNodes.push(hydrateResult.hNode);

    nodeCount += hydrateResult.nodeCount;

    insertedJsxCount++;
  }

  return {
    hNodes,
    nodeCount: nodeCount - nodeCountInit,
  };
}
