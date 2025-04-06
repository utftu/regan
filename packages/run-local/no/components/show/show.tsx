import {Atom} from 'strangelove';
import {FC, FCStaticParams} from '../../types.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper.tsx';
import {selectNamedRegan} from '../../atoms/atoms.ts';
import {NEED_AWAIT} from '../../consts.ts';

type Props = {
  when: Atom<boolean>;
};

const Show: FC<Props> & FCStaticParams = ({when}, {children}) => {
  return (
    <AtomWrapper
      atom={selectNamedRegan((get) => {
        const needShow = get(when);
        if (needShow === true) {
          return {
            // enabled
            name: 'e',
            value: children,
          };
        }

        return {
          // disabled
          name: 'd',
          value: null,
        };
      })}
    />
  );
};
Show[NEED_AWAIT] = true;

export {Show};
