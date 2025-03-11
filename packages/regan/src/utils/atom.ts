import {Atom} from 'strangelove';
import {HNode} from '../h-node/h-node.ts';

export const subsribeAtom = (hNode: HNode, atom: Atom, callback: any) => {
  hNode.mounts.push(() => {
    atom.listeners.subscribe(callback);

    hNode.unmounts.push(() => {
      atom.listeners.unsubscribe(callback);
    });
  });
};
