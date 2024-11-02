import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNodeBase, GlobalClientCtx} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {DomPointerElement} from '../types.ts';
import {createInsertedDomNodePromise} from '../utils/inserted-dom.ts';

export async function hydrateRaw({
  node,
  parentHNode,
  window: windowLocal = window,
  data = {},
  domPointer,
}: {
  parentHNode?: HNodeBase;
  node: JsxNode;
  window?: Window;
  data?: Record<any, any>;
  domPointer: DomPointerElement;
}) {
  const changedAtoms = new Set<Atom>();
  const globalCtx =
    parentHNode?.globalCtx ??
    new GlobalCtx({
      data,
      mode: 'client',
      root: new Root(),
    });

  const {hNode} = await node.hydrate({
    jsxSegmentName: '',
    textLength: 0,
    domPointer,
    parentHNode,
    globalCtx,
    parentWait: createInsertedDomNodePromise(),
    globalClientCtx:
      parentHNode?.glocalClientCtx ??
      new GlobalClientCtx({
        window: windowLocal,
        initDomPointer: domPointer,
      }),
    hydrateCtx: {
      // snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
    // atomDescendant: false,
    // atomDirectNode: false,
  });

  // globalCtx.root.addTx(
  //   changedAtoms.reduce((store, atom) => {
  //     store.set(atom, atom.get());
  //     return store;
  //   }, new Map())
  // );
  // mountHNodes(hNode);
}

export const hydrate = (
  element: HTMLElement,
  node: JsxNode,
  options: {window: Window} = {window}
) => {
  return hydrateRaw({
    domPointer: {
      parent: element,
      position: 0,
    },
    // getElementPointer() {
    //   return {
    //     parent: element,
    //   };
    // },
    window: options.window,
    node,
  });
};
