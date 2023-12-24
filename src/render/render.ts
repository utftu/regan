import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, mountHNodes, unmountHNodes} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';

type Options = {
  jsxPath?: string;
  parentHNode?: HNode;
  window?: Window;
  data?: Record<any, any>;
};

export const addElementChild = ({
  parent,
  prevEl = undefined,
  el,
}: {
  parent: HTMLElement;
  prevEl?: HTMLElement | void;
  el: HTMLElement | string;
}) => {
  if (typeof el === 'string') {
    if (!prevEl) {
      parent.innerHTML += el;
      return;
    }
    parent.insertAdjacentHTML('afterend', el);
    return;
  }

  if (!prevEl) {
    parent.appendChild(el);
    return;
  }

  prevEl.after(el);
  // parent.appendChild(child);
};

export const redner = async (
  domNode: HTMLElement,
  node: JSXNode,
  options: Options
) => {
  let el: HTMLElement | string;
  const changedAtoms: Atom[] = [];

  const {hNode} = await node.render({
    // dom: {parent: domNode},
    parentHNode: options.parentHNode,
    jsxSegmentStr: '',
    globalCtx: new GlobalCtx({
      window: options.window || window,
      stage: 'render',
      root: options.parentHNode?.globalCtx.root ?? new Root(),
    }),
    addElementToParent: (localEl) => {
      el = localEl;
    },
    renderCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  if (options.parentHNode?.unmounted === true) {
    return false;
  }

  addElementChild({parent: domNode, el: el!});
  mountHNodes(hNode);

  // return (parent: HTMLElement, prevEl: HTMLElement | number = 0) => {
  //   if (prevEl === 0) {
  //     addElementChild(parent, el);
  //   }
  //   addElementChild();
  // };

  return true;
};

export const rednerRaw = async ({
  node,
  options,
}: {
  node: JSXNode;
  options: Options;
}) => {
  let el: HTMLElement | string;
  const changedAtoms: Atom[] = [];

  const {hNode} = await node.render({
    // dom: {parent: domNode},
    parentHNode: options.parentHNode,
    jsxSegmentStr: '',
    globalCtx: new GlobalCtx({
      window: options.window || window,
      stage: 'render',
      root: options.parentHNode?.globalCtx.root ?? new Root(),
    }),
    addElementToParent: (localEl) => {
      el = localEl;
    },
    renderCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  // return ({
  //   parent,
  //   prevEl,
  // }: {
  //   parent: HTMLElement;
  //   prevEl?: HTMLElement | void;
  // }) => {
  //   addElementChild({parent, prevEl, el});
  //   mountHNodes(hNode);
  // };

  return {
    hNode,
    unmount: () => {
      unmountHNodes(hNode);
    },
    mount: ({
      parent,
      prevEl,
    }: {
      parent: HTMLElement;
      prevEl?: HTMLElement | void;
    }) => {
      addElementChild({parent, prevEl, el});
      mountHNodes(hNode);
    },
  };
};
