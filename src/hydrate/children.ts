import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, JSXNode} from '../node/node.ts';
import {Child, FCParams} from '../types.ts';
import {NAMED_ATOM_REGAN} from '../atoms/atoms.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {HCtx} from '../node/hydrate/hydrate.ts';
import {formatJsxValue} from '../utils/jsx.ts';

function handleAtom(
  atom: Atom,
  hContext: HCtx
): {name: string; value: JSXNode} | void {
  let value: any;
  let name: string;
  if ((atom as any as {[NAMED_ATOM_REGAN]: any})[NAMED_ATOM_REGAN]) {
    [name, value] = hContext.snapshot.parse(atom);
  } else {
    value = hContext.snapshot.parse(atom);
    name = '0';
  }

  if (value instanceof JSXNode) {
    return {name: `?a=${name}`, value};
  } else {
    return;
  }
}

export async function handleChildrenHydrate({
  children,
  parentHNode,
  dom,
  globalCtx,
  parentJsxSegment,
  hCtx: hContext,
  hNodeCtx,
}: {
  dom: DomProps;
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!(childOrAtom instanceof JSXNode) && !(childOrAtom instanceof Atom)) {
      continue;
    }

    let child: JSXNode;
    if (childOrAtom instanceof Atom) {
      child = new JsxNodeComponent({
        type: AtomWrapper,
        children: [],
        props: {
          atom: childOrAtom,
        },
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
      hCtx: hContext,
      hNodeCtx,
    });
    hydrateResults.push(hydrateResult);

    if (child instanceof JSXNodeElement) {
      position++;
    } else if (child instanceof JsxNodeComponent) {
      if (
        child.systemProps.needAwait === true ||
        (child.type as FCParams)[NEED_AWAIT] === true
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
