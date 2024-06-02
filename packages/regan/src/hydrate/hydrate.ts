import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx, mountHNodes} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {DomPointer} from '../types.ts';
import {Ctx} from '../ctx/ctx.ts';

export async function hydrateRaw({
  // getElementPointer,
  node,
  parentHNode,
  window: windowLocal = window,
  data = {},
  domPointer,
}: {
  // getElementPointer: () => ElementPointer;
  parentHNode?: HNode;
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
  // const {parent, prev} = getElementPointer();
  const {hNode} = await node.hydrate({
    jsxSegmentStr: '',
    domPointer: domPointer,
    // dom: {parent, position: getPosition(parent, prev)},
    parentHNode,
    globalCtx,

    hNodeCtx:
      parentHNode?.hNodeCtx ??
      new HNodeCtx({
        window: windowLocal,
        initDomPointer: domPointer,
        // getInitElemPointer: getElementPointer,
      }),
    hCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
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
