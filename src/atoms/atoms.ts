import {Atom, Root, SelectCb, createDefaultRoot, selectBase} from 'strangelove';

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

export const SELECT_REGAN_NAMED = Symbol('SELECT_REGAN_NAMED');
export function selectReganNamed<TCb extends SelectCb>(cb: TCb) {
  return selectBase<TCb>(cb, {
    root: getRoot(),
    onAtomCreate: (atom) => {
      (atom as any)[SELECT_REGAN_NAMED] = true;
    },
  });
}

// todo
// export function selectReganRunSecond<TCb extends SelectCb>(cb: TCb) {
//   let firstExec = true;
//   return selectRegan(cb);
// }
