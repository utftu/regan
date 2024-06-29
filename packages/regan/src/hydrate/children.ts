import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child, DomPointer} from '../types.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {HNode, HNodeBase, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {HCtx, ParentWait} from '../node/hydrate/hydrate.ts';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {
  InsertedDomNodes,
  createInsertedDomNodePromise,
  getInsertedCount,
} from '../utils/inserted-dom.ts';
import {HNodeText} from '../h-node/text.ts';

const wrapChildIfNeed = (child: JsxNode | Atom) => {
  if (child instanceof Atom) {
    return new JsxNodeComponent({
      type: AtomWrapper,
      children: [],
      props: {
        atom: child,
      },
      systemProps: {},
    });
  } else if (Array.isArray(child)) {
    return new JsxNodeComponent({
      type: Fragment,
      children: child,
      props: {},
      systemProps: {},
    });
  } else {
    return child;
  }
};

export async function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  hCtx: hContext,
  hNodeCtx,
  parentCtx,
  parentDomPointer,
  parentInsertedDomNodesPromise,
  // insertedDomNodes,
  atomDescendant,
  atomDirectNode,
}: // prevElemsCount,
// elemsCount,
{
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
  parentDomPointer: DomPointer;
  parentInsertedDomNodesPromise: ParentWait;
  // insertedDomNodes: InsertedDomNodes;
  atomDescendant: boolean;
  atomDirectNode: boolean;
}) {
  const hydrateResults: (ReturnType<JsxNode['hydrate']> | HNodeBase)[] = [];
  let position = parentDomPointer.position;
  let textLength = 0;
  let insertedJsxCount = 0;

  for (let i = 0; i < children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (typeof childOrAtom === 'string') {
      if (atomDescendant) {
        let textNodeStart = textLength;
        textLength += childOrAtom.length;

        const hNode = new HNodeText(
          {
            jsxSegment: parentJsxSegment,
            globalCtx,
            hNodeCtx,
          },
          {
            domPointer: {
              parent: parentDomPointer.parent,
              position: position,
            },
          },
          {
            start: textNodeStart,
            finish: textNodeStart + childOrAtom.length,
          }
        );

        hydrateResults.push(hNode);
      }
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
      parentCtx,
      hCtx: hContext,
      hNodeCtx,
    });
    hydrateResults.push(hydrateResult);

    const insertedCount = await getInsertedCount(
      child,
      insertedDomNodesPromise.promise
    );

    // console.log('-----', childOrAtom, insertedCount.elemsCount);

    // if (children.length === 2) {
    //   console.log('-----', 'insertedCount', insertedCount);
    // }

    position += insertedCount.elemsCount;
    textLength += insertedCount.textLength;

    insertedJsxCount++;
  }

  parentInsertedDomNodesPromise.promiseControls.resolve({
    elemsCount: position - parentDomPointer.position,
    textLength,
  });

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    hNodes: hydrateResultsData.map((value) => {
      if (value instanceof HNodeBase) {
        return value;
      }
      return value.hNode;
    }),
  };
}
