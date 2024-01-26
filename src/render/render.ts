import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx, mountHNodes, unmountHNodes} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {ElementPointer} from '../types.ts';
import {addElementChildren} from '../utils/dom.ts';

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

  const {hNode, connectElements} = await node.render({
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
    // addElementToParent: (localEl) => {
    //   elements.push(localEl);
    // },
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
      if (parentHNode) {
        parentHNode.addChildren([hNode]);
      }
      const {parent, prev} = getElemPointer();

      const elements = connectElements();
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
