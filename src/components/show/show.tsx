import {destroyIon, Ion, select} from 'strangelove';
import {FC} from '../../types.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper.tsx';

type Props = {
  when: Ion<any>;
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
    destroyIon(atom);
  });

  return <AtomWrapper atom={atom} />;
};

Show.reganInternal = true;
