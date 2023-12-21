import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {SELECT_REGAN_NAMED} from '../atoms/atoms.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {HNode} from '../h-node/h-node.ts';
import {DYNAMIC_INSERTED_COUNT, INSERTED_COUNT} from '../consts.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.ts';
import {HContext} from '../node/hydrate/hydrate.ts';

function handleAtom(
  atom: Atom,
  hContext: HContext
): {name: string; value: JSXNode} | void {
  let value: any;
  let name: string;
  if ((atom as any as {[SELECT_REGAN_NAMED]: any})[SELECT_REGAN_NAMED]) {
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

const prepareChild = (child: JSXNode | Atom, hContext: HContext) => {
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
      children: values ? [values.value] : [],
    });
    childNode = wrapper;
    additionalName = values ? values.name : '';
  } else {
    childNode = child;
  }

  return {
    childNode,
    additionalName,
  };
};

export async function handleChildrenHydrate({
  children,
  parentHNode,
  dom,
  globalCtx,
  parentJsxSegment,
  hContext,
}: {
  dom: DomProps;
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hContext: HContext;
}) {
  const hydrateResults: ReturnType<JSXNode['hydrate']>[] = [];
  let position = dom.position;
  for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {
    const rawChild = children[i];
    const child = typeof rawChild === 'function' ? rawChild() : rawChild;

    if (!(child instanceof JSXNode) && !(child instanceof Atom)) {
      continue;
    }

    const {childNode, additionalName} = prepareChild(child, hContext);

    const hydrateResult = childNode.hydrate({
      jsxSegmentStr: `${jsxNodeCount}${additionalName}`,
      parentJsxSegment,
      dom: {parent: dom.parent, position},
      parentHNode,
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
          const awaitedhResult = await hydrateResult;
          position += awaitedhResult.insertedCount;
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
