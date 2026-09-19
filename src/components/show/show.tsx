import {Atom, destroyAtom, select} from 'strangelove';
import {FC} from '../../types.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper.tsx';

type Props = {
  when: Atom<any>;
};

export const Show: FC<Props> = ({when}, ctx) => {
  const atom = select((get) => {
    const value = !!get(when);

    if (value === false) {
      return null;
    }

    return ctx.children;
  });

  ctx.unmount(() => {
    destroyAtom(atom);
  });

  return <AtomWrapper atom={atom} />;
};
