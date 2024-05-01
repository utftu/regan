import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx, mountHNodes} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {ElementPointer} from '../types.ts';
import {Ctx} from '../ctx/ctx.ts';

const getPosition = (parent: HTMLElement, prev: HTMLElement | void) => {
  if (!prev) {
    return 0;
  }

  return Array.from(parent.children).indexOf(prev);
};

export async function hydrateRaw({
  getElementPointer,
  node,
  parentHNode,
  window: windowLocal = window,
  data = {},
  parentCtx,
}: {
  getElementPointer: () => ElementPointer;
  parentHNode?: HNode;
  parentCtx?: Ctx;
  node: JsxNode;
  window?: Window;
  data?: Record<any, any>;
}) {
  const changedAtoms: Atom[] = [];
  const globalCtx =
    parentHNode?.globalCtx ??
    new GlobalCtx({
      data,
      mode: 'client',
      root: new Root(),
    });
  const {parent, prev} = getElementPointer();
  const {hNode} = await node.hydrate({
    jsxSegmentStr: '',
    dom: {parent, position: getPosition(parent, prev)},
    parentHNode,
    globalCtx,

    hNodeCtx:
      parentHNode?.hNodeCtx ??
      new HNodeCtx({
        window: windowLocal,
        getInitElemPointer: getElementPointer,
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
    getElementPointer() {
      return {
        parent: element,
      };
    },
    window: options.window,
    node,
  });
};
