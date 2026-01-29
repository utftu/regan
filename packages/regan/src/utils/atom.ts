import {Atom} from 'strangelove';
import {HNode} from '../h-node/h-node.ts';
import {AnyFunc} from '../types.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {Ctx} from '../ctx/ctx.ts';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';

const ATOM_WRAPPER_SUBSCRIPTIONS_KEY = '__atomWrapperAtoms';

export const subscribeAtomStages = ({
  atom,
  globalCtx,
  areaCtx,
}: {
  atom: Atom;
  globalCtx: GlobalCtx;
  areaCtx: AreaCtx;
}) => {
  let changed = false;

  const funcTemp = () => {
    changed = true;
  };
  areaCtx.updaterInit.add(atom, funcTemp);

  return (hNode: HNode, cb: AnyFunc) => {
    hNode.mounts.push(() => {
      const cbWapper = () => {
        cb(hNode);
      };
      areaCtx.updaterInit.remove(atom, funcTemp);
      globalCtx.updater.add(atom, cbWapper);

      hNode.unmounts.push(() => {
        globalCtx.updater.remove(atom, cbWapper);
      });

      if (changed === true) {
        cbWapper();
      }
    });
  };
};

export const subscribeAtomWrapper = ({
  atom,
  ctx,
  cb,
}: {
  atom: Atom;
  ctx: Ctx;
  cb: AnyFunc;
}) => {
  let changed = false;

  const func1 = () => {
    changed = true;
  };
  ctx.areaCtx.updaterInit.add(atom, func1);

  ctx.mount((hNode) => {
    // Avoid duplicate subscriptions when the same AtomWrapper re-renders before mount.
    let subscribed = (hNode.data as Record<string, Set<Atom> | undefined>)[
      ATOM_WRAPPER_SUBSCRIPTIONS_KEY
    ];
    if (!subscribed) {
      subscribed = new Set();
      (hNode.data as Record<string, Set<Atom>>)[ATOM_WRAPPER_SUBSCRIPTIONS_KEY] =
        subscribed;
    }
    if (subscribed.has(atom)) {
      ctx.areaCtx.updaterInit.remove(atom, func1);
      return;
    }
    subscribed.add(atom);

    const cbWapper = () => {
      cb(hNode);
    };

    ctx.areaCtx.updaterInit.remove(atom, func1);
    ctx.globalCtx.updater.add(atom, cbWapper);

    hNode.unmounts.push(() => {
      ctx.globalCtx.updater.remove(atom, cbWapper);
    });

    if (changed) {
      cbWapper();
    }
  });
};
