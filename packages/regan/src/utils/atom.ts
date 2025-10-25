import {Atom} from 'strangelove';
import {HNode} from '../h-node/h-node.ts';
import {AnyFunc} from '../types.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {Ctx} from '../ctx/ctx.ts';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';

export const subsribeAtomStages = ({
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
  ctx.areaCtx.updaterInit.add(atom, func1);

  ctx.mount((hNode) => {
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
