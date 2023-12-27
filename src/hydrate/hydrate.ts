import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx, mountHNodes} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {ElementPointer} from '../types.ts';

type HydrateConfig = {
  window?: Window;
  jsxPath?: string;
};

export async function hydrate(
  domNode: HTMLElement,
  node: JSXNode,
  config: HydrateConfig = {window}
) {
  const changedAtoms: Atom[] = [];
  const root = new Root();
  const globalCtx = new GlobalCtx({
    // window: config.window || window,
    // stage: 'hydrate',
    mode: 'server',
    root,
  });
  const {hNode} = await node.hydrate({
    jsxSegmentStr: '',
    dom: {parent: domNode, position: 0},
    parentHNode: undefined,
    globalCtx,
    hNodeCtx: new HNodeCtx({
      window: config.window || window,
      getInitElemPointer() {
        return {
          parent: domNode.parentElement!,
          prev: domNode.previousElementSibling as HTMLElement,
        };
      },
    }),
    hCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  // globalCtx.stage = 'idle';
  root.addTx(
    changedAtoms.reduce((store, atom) => {
      store.set(atom, atom.get());
      return store;
    }, new Map())
  );
  mountHNodes(hNode);
}

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
}: {
  getElementPointer: () => ElementPointer;
  parentHNode?: HNode;
  node: JSXNode;
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

export const hydrateNew = (element: HTMLElement, node: JSXNode) => {
  return hydrateRaw({
    getElementPointer() {
      return {
        parent: element.parentElement!,
      };
    },
    node,
  });
};
