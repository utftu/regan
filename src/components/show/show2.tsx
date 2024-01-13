import {Atom, atom} from 'strangelove';
import {ElementPointer, FC} from '../../types.ts';
import {rednerRaw} from '../../render/render.ts';
// import {JSXNode} from '../../node/node.ts';
import {Fragment} from '../fragment/fragment.ts';
import {
  findParentElement,
  findPrevElement,
} from '../../h-node/helpers/elements.ts';
import {unmountHNodes} from '../../h-node/h-node.ts';
import {AtomWrapper} from '../atom-wrapper/atom-wrapper-name.tsx';
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
