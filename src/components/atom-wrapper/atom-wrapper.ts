import {Atom} from 'strangelove';
import {subscribeAtomChange} from '../../atoms/atoms.ts';
import {FC} from '../../types.ts';

type Props = {
  atom: Atom;
};

// todo
export const AtomWrapper: FC<Props> = (props, ctx) => {
  let mounted = false;
  let needUpdaterAfterMount = false;

  subscribeAtomChange(props.atom, () => {
    if (mounted === false) {
      needUpdaterAfterMount = true;
      return;
    }
  });
  ctx.mount(() => {
    mounted = true;

    // if (needUpdaterAfterMount === true) {
    //   // planUpdate(ctx.getId(), () => {
    //   //   // todo
    //   // });
    // }
  });
  return ctx.children;
};
