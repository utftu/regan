import {Atom, select} from 'strangelove';
import {FC} from '../../types.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper.tsx';

type Props = {
  when: Atom<any>;
};

export const Show: FC<Props> = ({when}, {children}) => {
  return (
    <AtomWrapper
      atom={select((get) => {
        const value = !!get(when);

        if (value === false) {
          return null;
        }

        return children;
      })}
    />
  );
};
