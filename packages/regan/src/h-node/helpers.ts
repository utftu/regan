import {Atom} from 'strangelove';
import {destroyAtom} from '../atoms/atoms.ts';
import {Ctx} from '../ctx/ctx.ts';
import {HNode, HNodeBase} from './h-node.ts';
import {AynFunc} from '../types.ts';

export const createSmartMount = (ctx: Ctx) => (hNode: HNodeBase) => {
  const unmounts = ctx.state.mounts.map((mount) => mount());

  hNode.unmounts.push(() => {
    unmounts.forEach((possibleUnmount) => {
      if (typeof possibleUnmount === 'function') {
        possibleUnmount();
      }
    });
    ctx.state.atoms.forEach((possibleAtom) => {
      if (possibleAtom instanceof Promise) {
        possibleAtom.then((atom) => destroyAtom(atom));
      } else {
        destroyAtom(possibleAtom);
      }
    });
  });
};

export const subscribeWithAutoRemove = ({
  hNode,
  listener,
  atom,
}: {
  atom: Atom;
  listener: AynFunc;
  hNode: HNode;
}) => {
  hNode.mounts.push(() => {
    hNode.globalCtx.root.links.addExec(atom, listener);
    hNode.unmounts.push(() => {
      hNode.globalCtx.root.links.addExec(atom, listener);
    });
  });
};
