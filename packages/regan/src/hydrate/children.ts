import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, JsxNode} from '../node/node.ts';
import {Child, FCStaticParams} from '../types.ts';
import {NAMED_ATOM_REGAN} from '../atoms/atoms.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {HCtx} from '../node/hydrate/hydrate.ts';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';

export async function handleChildrenHydrate({
  children,
  parentHNode,
  dom,
  globalCtx,
  parentJsxSegment,
  hCtx: hContext,
  hNodeCtx,
  parentCtx,
}: {
  dom: DomProps;
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
}) {
  const hydrateResults: ReturnType<JsxNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!(childOrAtom instanceof JsxNode) && !(childOrAtom instanceof Atom)) {
      continue;
    }

    let child: JsxNode;
    if (childOrAtom instanceof Atom) {
      child = new JsxNodeComponent({
        type: AtomWrapper,
        children: [],
        props: {
          atom: childOrAtom,
        },
        systemProps: {},
      });
    } else if (Array.isArray(childOrAtom)) {
      child = new JsxNodeComponent({
        type: Fragment,
        children: childOrAtom,
        props: {},
        systemProps: {},
      });
    } else {
      child = childOrAtom;
    }

    const hydrateResult = child.hydrate({
      jsxSegmentStr: `${jsxNodeCount}`,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: jsxNodeCount,
      },
      dom: {parent: dom.parent, position},
      parentHNode,
      globalCtx,
      parentCtx,
      hCtx: hContext,
      hNodeCtx,
    });
    hydrateResults.push(hydrateResult);

    if (child instanceof JsxNodeElement) {
      position++;
    } else if (child instanceof JsxNodeComponent) {
      if (
        child.systemProps.needAwait === true ||
        (child.type as FCStaticParams)[NEED_AWAIT] === true
      ) {
        const awaitedhResult = await hydrateResult;
        position += awaitedhResult.insertedCount;
      } else if ('insertedTagsCount' in child.systemProps) {
        position += child.systemProps.insertedTagsCount!;
      } else if (INSERTED_TAGS_COUNT in child.type) {
        position += child.type[INSERTED_TAGS_COUNT] as number;
      } else {
        position++;
      }
    }

    jsxNodeCount++;
  }

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedCount: position - dom.position,
    hNodes: hydrateResultsData.map(({hNode}) => {
      return hNode;
    }),
  };
}
