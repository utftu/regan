import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {mountHydratedNodes} from '../hydrate/hydrate.ts';

type Options = {
  jsxPath?: string;
  parent?: HNode;
  window?: Window;
  data?: Record<any, any>;
};

export const addElementChild = (
  parent: HTMLElement,
  child: HTMLElement | string
) => {
  if (typeof child === 'string') {
    parent.innerHTML = child;
    return;
  }
  parent.appendChild(child);
};

export const redner = async (
  domNode: HTMLElement,
  node: JSXNode,
  options: Options
) => {
  let el: HTMLElement | string;
  const changedAtoms: Atom[] = [];

  const {hNode} = await node.render({
    dom: {parent: domNode},
    parentHNode: options.parent,
    jsxSegmentStr: '',
    globalCtx: new GlobalCtx({
      window: options.window || window,
      stage: 'render',
      root: options.parent?.globalCtx.root ?? new Root(),
    }),
    addElementToParent: (localEl) => {
      el = localEl;
    },
    renderCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  if (options.parent?.unmounted === true) {
    return false;
  }

  // console.log('-----', 'hNode', hNode);
  addElementChild(domNode, el!);
  mountHydratedNodes(hNode);
  // console.log('-----', 'hNode', hNode);
  // mountHydratedNodes(hNode);

  return true;
};
