import {Atom} from 'strangelove';
import {FC, FCParams} from '../../types.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper.tsx';
import {selectNamedRegan} from '../../atoms/atoms.ts';
import {NEED_AWAIT} from '../../consts.ts';

type Props = {
  when: Atom<boolean>;
};

const Show: FC<Props> & FCParams = ({when}, {children, systemProps}) => {
  systemProps.needAwait = true;
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
Show[NEED_AWAIT] = true;

export {Show};
