import {Atom} from 'strangelove';
import {FC, Props} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';

// export const parseAtom = (atom: Atom, initRun: boolean) => {
//   let additionalPart = '?a=';
//   let value = atom.get();

//   if (initRun) {
//     additionalPart += '0';
//   } else {
//     additionalPart += Date.now();
//   }

//   return {value, additionalPart};
// };

const getAdditionalPart = (initRun: boolean) => {
  if (initRun) {
    return '?a=0';
  }

  return `?a=${Date.now()}`;
};

export const AtomWrapper: FC<Props> = ({atom}, ctx) => {
  ctx.segmentEnt.pathSegment.name += getAdditionalPart(true);

  return <Fragment>{atom.get()}</Fragment>;
};
