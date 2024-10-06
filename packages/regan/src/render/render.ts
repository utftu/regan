import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {
  HNodeBase,
  HNodeCtx,
  mountHNodes,
  unmountHNodes,
} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {DomPointerElement} from '../types.ts';
import {Ctx} from '../ctx/ctx.ts';
import {createInsertedDomNodePromise} from '../utils/inserted-dom.ts';
import {convert} from '../v/convert.ts';

export const rednerRaw = async ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  jsxSegmentStr = '',
  parentCtx,
  domPointer,
}: {
  node: JsxNode;
  domPointer: DomPointerElement;
  window?: Window;
  data?: Record<any, any>;
  parentHNode?: HNodeBase;
  jsxSegmentStr?: string;
  parentCtx?: Ctx;
}) => {
  const changedAtoms: Atom[] = [];

  const {hNode} = await node.render({
    parentWait: createInsertedDomNodePromise(),
    parentHNode: parentHNode,
    parentPosition: domPointer.position,
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
        initDomPointer: domPointer,
        // getInitElemPointer: getElemPointer,
      }),
    renderCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  return {hNode};

  // return {
  //   hNode,
  //   unmount: () => {
  //     unmountHNodes(hNode);
  //   },
  //   mount: () => {
  //     if (parentHNode) {
  //       parentHNode.addChildren([hNode]);
  //     }
  //     // const {parent, prev} = getElemPointer();

  //     // const elements = connectElements();
  //     // addElementChildren({domPointer: domPointer, elements});
  //     // addElementChildren({parent, prev, elements});
  //     mountHNodes(hNode);
  //   },
  // };
};

export const render = async (
  element: HTMLElement,
  node: JsxNode,
  options: {window: Window} = {window}
) => {
  const {hNode} = await rednerRaw({
    node,
    domPointer: {
      parent: element,
      position: 0,
    },
    // getElemPointer: () => ({
    //   parent: element,
    // }),
    window: options.window,
  });

  const vNews = convert(hNode);

  // mount();
};
