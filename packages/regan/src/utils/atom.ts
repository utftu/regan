import {Atom} from 'strangelove';
import {HNode} from '../h-node/h-node.ts';
import {AnyFunc} from '../types.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {Ctx} from '../ctx/ctx.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';

export const subsribeAtomStages = ({
  atom,
  globalCtx,
}: {
  atom: Atom;
  globalCtx: GlobalCtx;
}) => {
  let changed = false;

  const funcTemp = () => {
    changed = true;
  };
  globalCtx.updaterInit.add(atom, funcTemp);

  return (hNode: HNode, cb: AnyFunc) => {
    hNode.mounts.push(() => {
      const cbWapper = () => {
        cb(hNode);
      };
      globalCtx.updaterInit.remove(atom, funcTemp);
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

export const subsribeAtomWrapper = ({
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
  ctx.globalCtx.updaterInit.add(atom, func1);

  ctx.mount((hNode) => {
    const cbWapper = () => {
      cb(hNode);
    };

    ctx.globalCtx.updaterInit.remove(atom, func1);
    ctx.globalCtx.updater.add(atom, cbWapper);

    hNode.unmounts.push(() => {
      ctx.globalCtx.updater.remove(atom, cbWapper);
    });

    if (changed) {
      cbWapper();
    }
  });
};
