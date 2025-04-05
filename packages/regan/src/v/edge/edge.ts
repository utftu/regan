import {HNodeText} from '../../h-node/text.ts';
import {VNew, VOld} from '../types.ts';

const edge = ({vNews, vOlds}: {vNews: VNew[]; vOlds: VOld[]}) => {
  const prevTextHNode = null as any as HNodeText | void;
  const nextTextHNode = null as any as HNodeText | void;

  const firstVOld = vOlds[0];
  const lastVOld = vOlds[vOlds.length - 1];

  const firstVNew = vNews[0];
  const lastVNew = vNews[vNews.length - 1];

  if (
    prevTextHNode &&
    nextTextHNode &&
    vOlds.length === 1 &&
    vOlds[0].type === 'text'
  ) {
    // split and delete
  }

  if (prevTextHNode && nextTextHNode && vOlds.length === 0) {
    // split and not delete
  }

  if (prevTextHNode && firstVOld.type === 'text') {
    // split left
  }

  if (prevTextHNode && lastVOld.type === 'text') {
    // split right
  }

  if (
    prevTextHNode &&
    nextTextHNode &&
    vNews.length === 1 &&
    firstVNew.type === 'text'
  ) {
    // join and add
  }

  if (prevTextHNode && nextTextHNode && vNews.length === 0) {
    // join
  }

  if (prevTextHNode && firstVNew.type === 'text') {
    // join left
  }

  if (prevTextHNode && lastVNew.type === 'text') {
    // join left
  }
};
