import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx, mountHNodes, unmountHNodes} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {ElementPointer} from '../types.ts';

type Options = {
  jsxPath?: string;
  parentHNode?: HNode;
  window?: Window;
  data?: Record<any, any>;
};

export const addElementChildren = ({
  parent,
  prev = undefined,
  elements,
}: {
  parent: HTMLElement;
  prev?: HTMLElement | void;
  elements: (HTMLElement | string)[];
}) => {
  if (!prev) {
    parent.prepend(...elements);
    return;
  }

  prev.after(...elements);
};

export const appendElementChild = ({
  parent,
  // prev,
  el,
}: {
  parent: HTMLElement;
  // prev?: HTMLElement | void;
  el: HTMLElement | string;
}) => {
  parent.append(el);
  // if (typeof el === 'string') {
  //   if (!prev) {
  //     parent.innerHTML += el;
  //     return;
  //   }
  //   parent.insertAdjacentHTML('afterend', el);
  //   return;
  // }

  // if (!prev) {
  //   parent.appendChild(el);
  //   return;
  // }

  // prev.after(el);
};

export const rednerRaw = async ({
  node,
  window: localWindow = window,
  getElemPointer,
  parentHNode,
  data,
  jsxSegmentStr = '',
}: {
  node: JSXNode;
  getElemPointer: () => ElementPointer;
  window?: Window;
  data?: Record<any, any>;
  parentHNode?: HNode;
  jsxSegmentStr?: string;
}) => {
  const elements: (HTMLElement | string)[] = [];
  const changedAtoms: Atom[] = [];

  const {hNode} = await node.render({
    parentHNode: parentHNode,
    jsxSegmentStr,
    globalCtx:
      parentHNode?.globalCtx ??
      new GlobalCtx({
        data,
        mode: 'client',
        root: new Root(),
      }),
    hNodeCtx:
      parentHNode?.hNodeCtx ??
      new HNodeCtx({
        window: localWindow,
        getInitElemPointer: getElemPointer,
      }),
    addElementToParent: (localEl) => {
      elements.push(localEl);
    },
    renderCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  return {
    hNode,
    unmount: () => {
      unmountHNodes(hNode);
    },
    mount: () => {
      const {parent, prev} = getElemPointer();

      addElementChildren({parent, prev, elements});
      mountHNodes(hNode);
    },
  };
};

export const render = async (
  element: HTMLElement,
  node: JSXNode,
  options: {window: Window} = {window}
) => {
  const {mount} = await rednerRaw({
    node,
    getElemPointer: () => ({
      parent: element,
    }),
    window: options.window,
  });
  mount();
};
