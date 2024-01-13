import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JSXNode} from '../node/node.ts';
import {AddElementToParent, RenderCtx} from '../node/render/render.ts';
import {Child} from '../types.ts';
import {HCtx} from '../node/hydrate/hydrate.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {NAMED_ATOM_REGAN} from '../atoms/atoms.ts';

const handleAtom = (
  atom: Atom,
  hContext: HCtx
): {name: string; value: JSXNode} | void => {
  let value: any;
  let name: string;
  if ((atom as any as {[NAMED_ATOM_REGAN]: any})[NAMED_ATOM_REGAN]) {
    const result = hContext.snapshot.parse(atom);
    value = result.name;
    name = result.name;
  } else {
    value = hContext.snapshot.parse(atom);
    name = Date.now().toString();
  }

  if (value instanceof JSXNode) {
    return {name: `?a=${name}`, value};
  } else {
    return;
  }
};

const prepareChild = (child: JSXNode | Atom, hCtx: HCtx) => {
  let childNode!: JSXNode;
  let additionalName = '';

  if (child instanceof Atom) {
    const values = handleAtom(child, hCtx);
    const wrapper = new JSXNodeComponent({
      type: AtomWrapper,
      props: {
        atom: child,
      },
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

export async function handleChildrenRender({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  addElementToParent,
  renderCtx,
  hNodeCtx,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  addElementToParent: AddElementToParent;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
}) {
  const hNodes: HNode[] = [];

  for (let i = 0, insertedJsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!child) {
      continue;
    }

    if (typeof child === 'string') {
      addElementToParent(child);
      continue;
    }

    const renderResult = await (child as JSXNode).render({
      parentHNode,
      globalCtx,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxNodeCount,
      },
      jsxSegmentStr: insertedJsxNodeCount.toString(),
      renderCtx,
      addElementToParent,
      hNodeCtx,
    });
    hNodes.push(renderResult.hNode);

    insertedJsxNodeCount++;
  }

  return {
    hNodes,
  };
}
