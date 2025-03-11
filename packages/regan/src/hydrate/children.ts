import {ContextEnt} from '../context/context.tsx';
import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Child, DomPointer} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {HydrateCtx} from './types.ts';

export type HandleChildrenHydrateResult = {
  hNodes: HNode[];
  elementsCount: number;
};

export function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  hydrateCtx,
  parentDomPointer,
  parentSegmentEnt,
  parentContextEnt,
  globalClientCtx,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  hydrateCtx: HydrateCtx;
  parentDomPointer: DomPointer;
  parentSegmentEnt: SegmentEnt;
  parentContextEnt?: ContextEnt;
}): HandleChildrenHydrateResult {
  const hNodes: HNode[] = [];
  let elementsCount = parentDomPointer.elementsCount;

  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      const textHNode = new HNodeText(
        {
          parent: parentHNode,
          globalCtx,
          globalClientCtx,
          segmentEnt: parentSegmentEnt,
        },
        {
          text: text,
        }
      );

      hNodes.push(textHNode);

      continue;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const hydrateResult = jsxNode.hydrate({
      jsxSegmentName: `${insertedJsxCount}`,
      parentContextEnt,
      parentSegmentEnt,
      domPointer: {
        parent: parentDomPointer.parent,
        elementsCount,
      },
      parentHNode,
      globalCtx,
      globalClientCtx,
      hydrateCtx,
    });
    hNodes.push(hydrateResult.hNode);
    elementsCount += hydrateResult.elementsCount;

    insertedJsxCount++;
  }

  return {
    hNodes,
    elementsCount,
  };
}
