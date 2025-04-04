import {Atom} from 'strangelove';
import {HNode} from '../h-node/h-node.ts';
import {AnyFunc} from '../types.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';

export const subsribeAtom = ({
  atom,
  atomsTracker,
}: {
  atom: Atom;
  atomsTracker: AtomsTracker;
}) => {
  let changed = false;

  atomsTracker.add(atom, () => {
    changed = true;
  });

  return (hNode: HNode, cb: AnyFunc) => {
    const cbWapper = () => {
      setTimeout(() => {
        cb();
      });
    };
    hNode.mounts.push(() => {
      atom.listeners.subscribe(cbWapper);

      if (changed === true) {
        cb();
      }

      hNode.unmounts.push(() => {
        atom.listeners.unsubscribe(cbWapper);
      });
    });
  };
};
