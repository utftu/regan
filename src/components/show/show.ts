import {Atom, select} from 'strangelove';
import {FC} from '../../types.ts';
import {createAtomRegan} from '../../atoms/atoms.ts';

type Props = {
  when: Atom<any>;
};

export const Show: FC<Props> = (props, ctx) => {
  // const atom = createAtom()

  let firstExec = true;
  select((get) => {
    const whenValue = get(props.when);
    if (firstExec === true) {
      firstExec = false;
      return whenValue;
    }
  });

  if (!!props.when.get() === false) {
    return null;
  }
  return ctx.children;
};
