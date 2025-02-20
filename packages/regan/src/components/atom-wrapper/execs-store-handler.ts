import {Atom} from 'strangelove';
import {HNodeAtomWrapper} from '../../h-node/component.ts';
import {ExecsStore} from '../../root/atoms-store/execs-store.ts';
import {HNode} from '../../h-node/h-node.ts';
import {markAndDetachChild} from './helpers.ts';

const collectAtoms = (hNodes: HNodeAtomWrapper[], atoms: Atom[]) => {
  hNodes.forEach((hNode) => {
    hNode.children.forEach((child) => {
      collectAtomsAndMark(child, atoms);
    });
  });
};

const collectAtomsAndMark = (hNode: HNode, atoms: Atom[]): Atom[] => {
  if (hNode instanceof HNodeAtomWrapper) {
    atoms.push(hNode.atom);

    markAndDetachChild(hNode);

    if (hNode.rendering === true) {
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
