import {Atom} from 'strangelove';
import {FC} from '../../types.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper.tsx';
import {selectNamedRegan} from '../../atoms/atoms.ts';

type Props = {
  when: Atom<boolean>;
};

export const Show: FC<Props> = ({when}, {children}) => {
  return (
    <AtomWrapper
      atom={selectNamedRegan((get) => {
        const needShow = get(when);
        if (needShow === true) {
          return {
            name: 't',
            value: children,
          };
        }

        return {
          name: 'f',
          value: null,
        };
      })}
    />
  );
};
