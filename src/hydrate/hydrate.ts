import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, mountHNodes} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';

// export function mountHNodes(hNode: HNode) {
//   hNode.mount();
//   hNode.children.forEach(mountHNodes);
// }

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
    window: config.window || window,
    stage: 'hydrate',
    root,
  });
  const {hNode} = await node.hydrate({
    jsxSegmentStr: '',
    dom: {parent: domNode, position: 0},
    parentHNode: undefined,
    globalCtx,
    hContext: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms,
    },
  });

  globalCtx.stage = 'idle';
  root.addTx(
    changedAtoms.reduce((store, atom) => {
      store.set(atom, atom.get());
      return store;
    }, new Map())
  );
  mountHNodes(hNode);
}
