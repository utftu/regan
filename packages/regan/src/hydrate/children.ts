import {createErrorRegan} from '../errors/errors.tsx';
import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
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
import {HydrateCtx} from './types.ts';

export type HandleChildrenHydrateResult = {
  hNodes: HNode[];
  nodeCount: number;
  lastText: boolean;
};

export function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  hydrateCtx,
  parentDomPointer,
  parentSegmentEnt,
  areaCtx: areaCtx,
  lastText: propsLastText,
}: {
  children: SingleChild[];
  parentHNode: HNode;
  globalCtx: GlobalCtx;
  hydrateCtx: HydrateCtx;
  parentDomPointer: DomPointer;
  parentSegmentEnt: SegmentEnt;
  lastText: boolean;
  areaCtx: AreaCtx;
}): HandleChildrenHydrateResult {
  const hNodes: HNode[] = [];
  const nodeCountInit = parentDomPointer.nodeCount;
  let nodeCount = nodeCountInit;

  let lastText = propsLastText;

  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      let textNode: Text;

      if (nodeCount === 0) {
        textNode = parentDomPointer.parent.firstChild as Text;
      } else if (lastText === true) {
        textNode = parentDomPointer.parent.childNodes[nodeCount - 1] as Text;
      } else {
        textNode = parentDomPointer.parent.childNodes[nodeCount] as Text;
      }

      const textHNode = new HNodeText(
        {
          parent: parentHNode,
          globalCtx,
          segmentEnt: parentSegmentEnt,
        },
        {
          text: text,
          textNode: textNode as Text,
        }
      );

      hNodes.push(textHNode);

      if (lastText === false) {
        nodeCount++;
      }

      lastText = true;

      continue;
    }

    if (checkAllowedStructure(childOrAtom) === false) {
      const errorRegan = createErrorRegan({
        error: new Error('Invalid structura'),
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
      hydrateCtx,
      lastText,
      areaCtx,
    });
    hNodes.push(hydrateResult.hNode);

    lastText = hydrateResult.lastText;
    nodeCount += hydrateResult.nodeCount;

    insertedJsxCount++;
  }

  return {
    hNodes,
    nodeCount: nodeCount - nodeCountInit,
    lastText: lastText,
  };
}
