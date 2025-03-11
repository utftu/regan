import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child, DomPointerWithText} from '../types.ts';
import {HNode, HNodeBase, GlobalClientCtx} from '../h-node/h-node.ts';
import {
  checkAllowedPrivitive,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {
  createInsertedDomNodePromise,
  getInsertedInfo,
} from '../utils/inserted-dom.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt} from '../context/context.tsx';
import {HydrateCtx, ParentWait} from './types.ts';
import {HNodeText} from '../h-node/text.ts';

export async function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  hydrateCtx,
  parentDomPointer,
  parentInsertedDomNodesPromise,
  parentSegmentEnt,
  parentContextEnt,
  globalClientCtx,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  hydrateCtx: HydrateCtx;
  parentDomPointer: DomPointerWithText;
  parentInsertedDomNodesPromise: ParentWait;
  parentSegmentEnt: SegmentEnt;
  parentContextEnt?: ContextEnt;
}) {
  const rawHydrates: (ReturnType<JsxNode['hydrate']> | HNode)[] = [];
  let nodesCount = parentDomPointer.nodeCount;
  let textLength: undefined | number = parentDomPointer.textLength;

  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();
      let start: number;
      let textNode: Text;

      // add to prev
      if (typeof textLength === 'number') {
        textNode = parentDomPointer.parent.childNodes[
          parentDomPointer.nodeCount - 1
        ] as Text;
        textLength += text.length;
        start = textLength;
      } else {
        textNode = parentDomPointer.parent.childNodes[
          parentDomPointer.nodeCount
        ] as Text;
        nodesCount++;
        textLength = text.length;
        start = 0;
      }

      const textHNode = new HNodeText(
        {
          parent: parentHNode,
          globalCtx,
          globalClientCtx,
          segmentEnt: parentSegmentEnt,
          // contextEnt: parentContextEnt,
        },
        {
          textNode,
          start,
          text: text,
        }
      );

      rawHydrates.push(textHNode);

      continue;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const insertedDomPromise = createInsertedDomNodePromise();

    const hydrateResult = jsxNode.hydrate({
      jsxSegmentName: `${insertedJsxCount}`,
      parentWait: insertedDomPromise,
      parentContextEnt,
      parentSegmentEnt,
      domPointer: {
        parent: parentDomPointer.parent,
        nodeCount: nodesCount,
        textLength,
      },
      parentHNode,
      globalCtx,
      globalClientCtx,
      hydrateCtx,
    });
    rawHydrates.push(hydrateResult);

    const insertedCount = await getInsertedInfo(
      jsxNode,
      insertedDomPromise.promise
    );

    nodesCount += insertedCount.nodeCount;

    if (
      typeof insertedCount.textLength === 'number' &&
      typeof textLength === 'number'
    ) {
      textLength += insertedCount.textLength;
    } else {
      textLength = textLength;
    }

    insertedJsxCount++;
  }

  parentInsertedDomNodesPromise.promiseControls.resolve({
    nodeCount: nodesCount - parentDomPointer.nodeCount,
    textLength,
  });

  const hydrateResultsData = await Promise.all(rawHydrates);

  return {
    hNodes: hydrateResultsData.map((value) => {
      if (value instanceof HNodeBase) {
        return value;
      }
      return value.hNode;
    }),
  };
}
