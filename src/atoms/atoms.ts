import {
  Atom,
  Root,
  SelectCb,
  createDefaultRoot,
  selectBase,
  disconnectAtoms,
} from 'strangelove';

let root: Root | null = null;

export function getRoot() {
  if (root === null) {
    root = createDefaultRoot();
  }
  return root;
}

export function createAtomRegan(value: any) {
  return new Atom({
    root: getRoot(),
    value,
  });
}

export function selectRegan<TCb extends SelectCb>(cb: TCb) {
  return selectBase<TCb>(cb, {
    root: getRoot(),
    onAtomCreate: () => {},
  });
}

export function subscribeAtomChange(atom: Atom, exec: () => void) {
  const newAtom = new Atom({
    root: getRoot(),
    exec() {
      exec();
      return true;
    },
  });
  Atom.connect(atom, newAtom);
  return newAtom;
}

export const NAMED_ATOM_REGAN = Symbol('SELECT_REGAN_NAMED');
export function selectNamedRegan<TCb extends SelectCb>(cb: TCb) {
  return selectBase<TCb>(cb, {
    root: getRoot(),
    onAtomCreate: (atom) => {
      (atom as any)[NAMED_ATOM_REGAN] = true;
    },
  });
}

export const checkNamedAtom = (atom: Atom) => {
  if (NAMED_ATOM_REGAN in atom) {
    return true;
  }
  return false;
};

export function destroyAtom(atom: Atom) {
  for (const parent of atom.relations.parents) {
    disconnectAtoms(parent, atom);
  }
  atom.transaction = {};
}
