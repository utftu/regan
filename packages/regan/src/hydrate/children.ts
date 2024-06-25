import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child, DomPointer} from '../types.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {HNodeBase, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {HCtx, InsertedDomNodesPromise} from '../node/hydrate/hydrate.ts';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {
  InsertedDomNodes,
  createInsertedDomNodePromise,
  getInsertedCount,
} from '../utils/inserted-dom.ts';
import {hydrateDynamicText} from '../node/variants/dynamic-text/dynamic-text.ts';

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
  insertedDomNodes,
  atomDescendant,
  atomDirectNode,
}: {
  children: Child[];
  parentHNode?: HNodeBase;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
  parentDomPointer: DomPointer;
  parentInsertedDomNodesPromise: InsertedDomNodesPromise;
  insertedDomNodes: InsertedDomNodes;
  atomDescendant: boolean;
  atomDirectNode: boolean;
}) {
  const hydrateResults: (ReturnType<JsxNode['hydrate']> | HNodeBase)[] = [];
  const localInsertedDomNodes: InsertedDomNodes = [];
  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (typeof childOrAtom === 'string') {
      localInsertedDomNodes.push({
        type: 'text',
        length: childOrAtom.length,
      });

      if (atomDirectNode) {
        const hNode = hydrateDynamicText({
          text: childOrAtom,
          domPointer: parentDomPointer,
          insertedDomNodes: [...insertedDomNodes, ...localInsertedDomNodes],
          hNodeCtx,
          jsxSegment: parentJsxSegment,
          globalCtx,
        });
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
      parentInsertedDomNodesPromise: insertedDomNodesPromise,
      insertedDomNodes: [...insertedDomNodes, ...localInsertedDomNodes],

      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxCount,
      },
      domPointer: {
        parent: parentDomPointer.parent,
        position: parentDomPointer.position + localInsertedDomNodes.length,
      },
      parentHNode,
      globalCtx,
      parentCtx,
      hCtx: hContext,
      hNodeCtx,
    });
    hydrateResults.push(hydrateResult);

    const insertedDomNodesLocal = await getInsertedCount(
      child,
      insertedDomNodesPromise.promise
    );

    localInsertedDomNodes.push(...insertedDomNodesLocal);
    insertedJsxCount++;
  }

  parentInsertedDomNodesPromise.promiseControls.resolve(localInsertedDomNodes);

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedDomNodes: localInsertedDomNodes,
    hNodes: hydrateResultsData.map((value) => {
      if (value instanceof HNodeBase) {
        return value;
      }
      return value.hNode;
    }),
  };
}
