import {HNodeElement} from '../element.ts';
import {HNode} from '../h-node.ts';
import {Checker, CheckerAnswer} from './find.ts';

// element boundary
// sure not that HNode
export const findPrevHNode = (hNode: HNode, checker: Checker) => {
  const result = findPrevUp(hNode, checker);

  if (result instanceof HNode) {
    return result;
  }
};

const findPrevUp = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const parent = hNode.parent;

  if (!parent) {
    return;
  }

  const childPosition = parent.children.indexOf(hNode);

  for (let i = childPosition - 1; i >= 0; i--) {
    const child = parent.children[i];

    const checkerAnswer = checker(child);

    if (checkerAnswer instanceof HNode) {
      return child;
    }

    if (checkerAnswer === 'stop') {
      return 'stop';
    }

    const downAnswer = findPrevDown(child, checker);
    if (downAnswer instanceof HNode) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return;
    }
  }

  if (parent instanceof HNodeElement) {
    return;
  }

  return findPrevUp(parent, checker);
};

// not check hNode
const findPrevDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  for (let i = hNode.children.length - 1; i > 0; i--) {
    const child = hNode.children[i];

    const downAnswer = findPrevDown(child, checker);

    if (downAnswer instanceof HNode) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return 'stop';
    }
  }
};
