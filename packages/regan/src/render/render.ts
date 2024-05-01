import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx, mountHNodes, unmountHNodes} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {ElementPointer} from '../types.ts';
import {addElementChildren} from '../utils/dom.ts';
import {Ctx} from '../ctx/ctx.ts';

export const rednerRaw = async ({
  node,
  window: localWindow = window,
  getElemPointer,
  parentHNode,
  data,
  jsxSegmentStr = '',
  parentCtx,
}: {
  node: JsxNode;
  getElemPointer: () => ElementPointer;
  window?: Window;
  data?: Record<any, any>;
  parentHNode?: HNode;
  jsxSegmentStr?: string;
  parentCtx?: Ctx;
}) => {
  const changedAtoms: Atom[] = [];

  const {hNode, connectElements} = await node.render({
    parentHNode: parentHNode,
    jsxSegmentStr,
    parentCtx,
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
  node: JsxNode,
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
