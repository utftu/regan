import {Ion} from 'strangelove';
import {AnyFunc} from '../../types.ts';
import {Ctx} from '../../ctx/ctx.ts';

const ATOM_WRAPPER_SUBSCRIPTIONS_KEY = '__atomWrapperAtoms';

export const subscribeAtomWrapper = ({
  atom,
  ctx,
  cb,
}: {
  atom: Ion;
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
    let subscribed = (hNode.data as Record<string, Set<Ion> | undefined>)[
      ATOM_WRAPPER_SUBSCRIPTIONS_KEY
    ];
    if (!subscribed) {
      subscribed = new Set();
      (hNode.data as Record<string, Set<Ion>>)[ATOM_WRAPPER_SUBSCRIPTIONS_KEY] =
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
