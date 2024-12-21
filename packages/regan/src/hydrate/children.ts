import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child, DomPointerElement} from '../types.ts';
import {HNode, HNodeBase, GlobalClientCtx} from '../h-node/h-node.ts';
import {formatJsxValue, wrapChildIfNeed} from '../utils/jsx.ts';
import {
  createInsertedDomNodePromise,
  getInsertedInfo,
} from '../utils/inserted-dom.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt} from '../context/context.tsx';
import {HydrateCtx, ParentWait} from './types.ts';
import {HNodeText} from '../h-node/text.ts';

const handleWait = async (parentWait: ParentWait) => {};

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
  textLength,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  hydrateCtx: HydrateCtx;
  parentDomPointer: DomPointerElement;
  parentInsertedDomNodesPromise: ParentWait;
  parentSegmentEnt: SegmentEnt;
  parentContextEnt: ContextEnt;
  textLength: number;
}) {
  const rawHydrates: (ReturnType<JsxNode['hydrate']> | HNode)[] = [];
  let elementPosition = parentDomPointer.position;
  let currentTextLength = textLength;
  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (typeof childOrAtom === 'string') {
      currentTextLength += childOrAtom.length;

      const textNode = parentDomPointer.parent.childNodes[
        elementPosition
      ] as Text;

      const textHNode = new HNodeText(
        {
          parent: parentHNode,
          globalCtx,
          globalClientCtx,
          segmentEnt: parentSegmentEnt,
          contextEnt: parentContextEnt,
        },
        {
          textNode: parentDomPointer.parent,
        }
      );

      // if (!prevTextHNode) {
      // }

      // if (atomDescendant) {
      //   const textNode = getPrevTextNode(
      //     hNodeCtx.window,
      //     parentDomPointer.parent,
      //     position
      //   )!;
      //   let textNodeStart = textLength;
      //   textLength += childOrAtom.length;

      //   const hNode = new HNodeText(
      //     {
      //       jsxSegment: parentJsxSegment,
      //       globalCtx,
      //       globalClientCtx: hNodeCtx,
      //     },
      //     {
      //       text: childOrAtom,
      //       atomDirectNode: atomDirectNode,
      //       domNode: textNode,
      //       start: textNodeStart,
      //       finish: textLength,
      //     }
      //   );

      // rawHydrate.push(hNode);
      // }
      continue;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const insertedDomPromise = createInsertedDomNodePromise();

    const hydrateResult = jsxNode.hydrate({
      // atomDescendant: isAtom || atomDescendant,
      // atomDirectNode: isAtom || atomDirectNode,
      textLength: currentTextLength,
      jsxSegmentName: `${insertedJsxCount}`,
      parentWait: insertedDomPromise,
      parentContextEnt,
      parentSegmentEnt,
      domPointer: {
        parent: parentDomPointer.parent,
        position: elementPosition,
      },
      parentHNode,
      globalCtx,
      globalClientCtx,
      hydrateCtx,
    });
    rawHydrates.push(hydrateResult);

    // if hydrateResult is faster than no elementChildren and all components await
    const result = await Promise.race([
      hydrateResult,
      insertedDomPromise.promise,
    ]);

    // if ('hNode' in result) {
    // }

    // result

    const insertedCount = await getInsertedInfo(
      jsxNode,
      insertedDomPromise.promise
    );

    elementPosition += insertedCount.elemsCount;
    textLength += insertedCount.textLength;

    insertedJsxCount++;
  }

  parentInsertedDomNodesPromise.promiseControls.resolve({
    elemsCount: elementPosition - parentDomPointer.position,
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
