import {Atom} from 'strangelove';
import {AtomWrapperData} from '../../h-node/component.ts';
import {ExecsStore} from '../../root/atoms-store/execs-store.ts';
import {HNode} from '../../h-node/h-node.ts';

const collectAtoms = (atomWrappersData: AtomWrapperData[], atoms: Atom[]) => {
  atomWrappersData.forEach((atomWrapperData) => {
    atoms.push(atomWrapperData.atom);
    atomWrapperData.hNode.children.forEach((child) => {
      collectAtomsAndMark(child, atoms);
    });
    // collectAtomsAndMark(atomWrapperData.hNode, atoms);
  });
};

export const markAndDetachChild = (atomWrapperData: AtomWrapperData) => {
  atomWrapperData.willUnmount = true;

  atomWrapperData.unsibscribeWrapper?.();
};

const collectAtomsAndMark = (hNode: HNode, atoms: Atom[]): Atom[] => {
  if ('atomWrapperData' in hNode.data) {
    atoms.push(hNode.data.atomWrapperData.atom);

    markAndDetachChild(hNode.data.atomWrapperData);

    if (hNode.data.atomWrapperData.rendering === true) {
      return [];
    }
  }

  hNode.children.forEach((child) => {
    collectAtomsAndMark(child, atoms);
  });

  return atoms;
};

export const execsStoreHandler = (execsStore: ExecsStore) => {
  const innerAtomsFromWrappers: Atom[] = [];

  collectAtoms(execsStore.atomWrappers, innerAtomsFromWrappers);

  const localChanges = innerAtomsFromWrappers.reduce((map, atom) => {
    if (map.has(atom)) {
      return map;
    }
    map.set(atom, atom.get());
    return map;
  }, new Map<Atom, any>());

  return localChanges;
};
