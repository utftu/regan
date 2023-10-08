import {Root, createDefaultRoot} from 'strangelove';

let root: Root | null = null;

export function getRoot() {
  if (root === null) {
    root = createDefaultRoot();
  }
  return root;
}
