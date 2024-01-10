import {Atom, atom} from 'strangelove';
import {subscribeAtomChange} from '../../atoms/atoms.ts';
import {FC} from '../../types.ts';

type Props = {
  atom: Atom;
};

// todo
export const AtomWrapper: FC<Props> = ({atom}, {globalCtx}) => {
  if (globalCtx.mode === 'server') {
    return atom.get();
  }
  return atom.get();
};
