import {Atom} from 'strangelove';
import {FC, Props} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {subsribeAtom} from '../../utils/atom.ts';
import {a} from 'vite-node/dist/index-O2IrwHKf.js';
import {detachChildren} from '../../h-node/helpers.ts';
import {rednerBasic, rednerVirtual} from '../../render/render.ts';
import {VOld} from '../../v/types.ts';
import {findPrevDomNodeHNode} from '../../h-node/find/dom-node/dom-node.ts';
import {getDomPointer} from './dom-pointer.ts';

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
  const initPathSegmentName = ctx.segmentEnt.pathSegment.name;
  ctx.segmentEnt.pathSegment.name += getAdditionalPart(true);

  let vOlds: VOld[] = [];

  ctx.mount((hNode) => {
    atom.listeners.subscribe(() => {
      // ctx.segmentEnt.pathSegment.name += getAdditionalPart(false);

      detachChildren(hNode);

      ctx.segmentEnt.pathSegment.clearCache();

      ctx.segmentEnt.pathSegment.name =
        initPathSegmentName + getAdditionalPart(false);

      const domPointer = getDomPointer(hNode);

      const {renderTemplate} = rednerBasic({
        node: <Fragment>{atom.get()}</Fragment>,
        parentHNode: hNode,
        window: hNode.globalClientCtx.window,
        parentSegmentEnt: ctx.segmentEnt,
        domPointer,
      });
    });

    rednerVirtual({
      node: <Fragment>{atom.get()}</Fragment>,
      parentHNode: hNode,
      window: hNode.globalClientCtx.window,
      parentSegmentEnt: ctx.segmentEnt,
      domPointer: getInsertDomPointer(hNode),
    });
  });

  return <Fragment>{atom.get()}</Fragment>;
};
