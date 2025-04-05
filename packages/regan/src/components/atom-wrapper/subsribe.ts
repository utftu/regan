import {Atom} from 'strangelove';
import {AtomsTracker} from '../../atoms-tracker/atoms-tracker.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {AnyFunc} from '../../types.ts';

export const subsribeAtomWrapper = ({
  atom,
  atomsTracker,
  ctx,
  cb,
}: {
  atom: Atom;
  atomsTracker: AtomsTracker;
  ctx: Ctx;
  cb: AnyFunc;
}) => {
  let changed = false;

  atomsTracker.add(atom, () => {
    changed = true;
  });

  const cbWapper = () => {
    setTimeout(() => {
      cb();
    });
  };

  ctx.mount((hNode) => {
    atom.listeners.subscribe(cbWapper);

    if (changed === true) {
      cb();
    }

    hNode.unmounts.push(() => {
      atom.listeners.unsubscribe(cbWapper);
    });
  });
};
