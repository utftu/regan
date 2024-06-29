import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNodeBase, HNodeCtx, mountHNodes} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {DomPointer} from '../types.ts';
import {Ctx} from '../ctx/ctx.ts';
import {createInsertedDomNodePromise} from '../utils/inserted-dom.ts';

export async function hydrateRaw({
  node,
  parentHNode,
  window: windowLocal = window,
  data = {},
  domPointer,
}: {
  parentHNode?: HNodeBase;
  parentCtx?: Ctx;
  node: JsxNode;
  window?: Window;
  data?: Record<any, any>;
  domPointer: DomPointer;
}) {
  const changedAtoms: Atom[] = [];
  const globalCtx =
    parentHNode?.globalCtx ??
    new GlobalCtx({
      data,
      mode: 'client',
      root: new Root(),
    });

  const {hNode} = await node.hydrate({
    jsxSegmentStr: '',
    domPointer: domPointer,
    parentHNode,
    globalCtx,
    parentWait: createInsertedDomNodePromise(),
    // insertedDomNodes: [],
    hNodeCtx:
      parentHNode?.hNodeCtx ??
      new HNodeCtx({
        window: windowLocal,
        initDomPointer: domPointer,
      }),
    hCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
    atomDescendant: false,
    atomDirectNode: false,
  });

  globalCtx.root.addTx(
    changedAtoms.reduce((store, atom) => {
      store.set(atom, atom.get());
      return store;
    }, new Map())
  );
  mountHNodes(hNode);
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
