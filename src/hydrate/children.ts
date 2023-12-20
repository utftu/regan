import {Atom, atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, HContext, JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {SELECT_REGAN_NAMED} from '../atoms/atoms.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {HNode} from '../h-node/h-node.ts';
import {DYNAMIC_INSERTED_COUNT, INSERTED_COUNT} from '../consts.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.ts';

function handleAtom(atom: Atom, hContext: HContext): [string, JSXNode] | void {
  let value: any;
  let name: string;
  if ((atom as any as {[SELECT_REGAN_NAMED]: any})[SELECT_REGAN_NAMED]) {
    [name, value] = hContext.snapshot.parse(atom);
  } else {
    value = hContext.snapshot.parse(atom);
    name = '0';
  }

  if (value instanceof JSXNode) {
    return [`?a=${name}`, value];
  } else {
    return;
  }
}

export async function handleChildrenHydrate({
  children,
  parentHydratedNode,
  dom,
  globalCtx,
  parentJsxSegment,
  hContext,
}: {
  dom: DomProps;
  children: Child[];
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hContext: HContext;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!(child instanceof JSXNode) && !(child instanceof Atom)) {
      continue;
    }

    let childNode!: JSXNode;
    let additionalName = '';

    if (child instanceof Atom) {
      const values = handleAtom(child, hContext);
      const wrapper = new JSXNodeComponent({
        type: AtomWrapper,
        props: {
          atom: child,
        },
        key: '',
        children: values ? [values[1]] : [],
      });
      childNode = wrapper;
      additionalName = values ? values[0] : '';
    } else {
      childNode = child;
    }

    const hydrateResult = childNode.hydrate({
      jsxSegmentStr: `${jsxNodeCount}${additionalName}`,
      parentJsxSegment,
      dom: {parent: dom.parent, position},
      parentHydratedNode,
      globalCtx,
      hContext,
    });
    hydrateResults.push(hydrateResult);

    if (childNode instanceof JSXNodeElement) {
      position++;
    } else if (childNode instanceof JSXNodeComponent) {
      if (INSERTED_COUNT in childNode.type) {
        if (childNode.type[INSERTED_COUNT] !== DYNAMIC_INSERTED_COUNT) {
          position += childNode.type[INSERTED_COUNT] as number;
        } else {
          const awaitedhydratedResult = await hydrateResult;
          position += awaitedhydratedResult.insertedCount;
        }
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
