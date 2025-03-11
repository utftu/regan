import {Atom} from 'strangelove';
import {HNode} from '../h-node/h-node.ts';
import {AnyFunc} from '../types.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';

export const subsribeAtom = ({
  hNode,
  atom,
  callback,
  atomsTracker,
}: {
  hNode: HNode;
  atom: Atom;
  callback: AnyFunc;
  atomsTracker: AtomsTracker;
}) => {
  let changed = false;

  atomsTracker.add(atom, () => {
    changed = true;
  });

  hNode.mounts.push(() => {
    atom.listeners.subscribe(callback);

    if (changed === true) {
      callback();
    }

    hNode.unmounts.push(() => {
      atom.listeners.unsubscribe(callback);
    });
  });

  atom.listeners.subscribe(callback);

  hNode.unmounts.push(() => {
    atom.listeners.unsubscribe(callback);
  });
};
