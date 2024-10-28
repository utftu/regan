import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child, DomPointerElement} from '../types.ts';
import {HNode, HNodeBase, GlobalClientCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HCtx, ParentWait} from '../node/hydrate/hydrate.ts';
import {formatJsxValue, wrapChildIfNeed} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {
  createInsertedDomNodePromise,
  getInsertedCount,
} from '../utils/inserted-dom.ts';
import {HNodeText} from '../h-node/text.ts';
import {getPrevTextNode} from '../utils/dom.ts';

export async function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  hCtx: hContext,
  hNodeCtx,
  // parentCtx,
  parentDomPointer,
  parentInsertedDomNodesPromise,
  atomDescendant,
  atomDirectNode,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hCtx: HCtx;
  hNodeCtx: GlobalClientCtx;
  // parentCtx?: Ctx;
  parentDomPointer: DomPointerElement;
  parentInsertedDomNodesPromise: ParentWait;
  atomDescendant: boolean;
  atomDirectNode: boolean;
}) {
  const rawHydrate: (ReturnType<JsxNode['hydrate']> | HNode)[] = [];
  let position = parentDomPointer.position;
  let textLength = 0;
  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (typeof childOrAtom === 'string') {
      if (atomDescendant) {
        const textNode = getPrevTextNode(
          hNodeCtx.window,
          parentDomPointer.parent,
          position
        )!;
        let textNodeStart = textLength;
        textLength += childOrAtom.length;

        const hNode = new HNodeText(
          {
            jsxSegment: parentJsxSegment,
            globalCtx,
            globalClientCtx: hNodeCtx,
          },
          {
            text: childOrAtom,
            atomDirectNode: atomDirectNode,
            domNode: textNode,
            start: textNodeStart,
            finish: textLength,
          }
        );

        rawHydrate.push(hNode);
      }
      continue;
    }

    if (!(childOrAtom instanceof JsxNode) && !(childOrAtom instanceof Atom)) {
      continue;
    }

    const isAtom = childOrAtom instanceof Atom;
    const child = wrapChildIfNeed(childOrAtom);

    const insertedDomNodesPromise = createInsertedDomNodePromise();

    const hydrateResult = child.hydrate({
      atomDescendant: isAtom || atomDescendant,
      atomDirectNode: isAtom || atomDirectNode,
      jsxSegmentStr: `${insertedJsxCount}`,
      parentWait: insertedDomNodesPromise,

      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxCount,
      },
      domPointer: {
        parent: parentDomPointer.parent,
        position: position,
      },
      parentHNode,
      globalCtx,
      // parentCtx,
      hCtx: hContext,
      hNodeCtx,
    });
    rawHydrate.push(hydrateResult);

    const insertedCount = await getInsertedCount(
      child,
      insertedDomNodesPromise.promise
    );

    position += insertedCount.elemsCount;
    textLength += insertedCount.textLength;

    insertedJsxCount++;
  }

  parentInsertedDomNodesPromise.promiseControls.resolve({
    elemsCount: position - parentDomPointer.position,
    textLength,
  });

  const hydrateResultsData = await Promise.all(rawHydrate);

  return {
    hNodes: hydrateResultsData.map((value) => {
      if (value instanceof HNodeBase) {
        return value;
      }
      return value.hNode;
    }),
  };
}
