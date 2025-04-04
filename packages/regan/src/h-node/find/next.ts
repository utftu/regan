import {HNode} from '../h-node.ts';
import {Checker, CheckerAnswer} from './find.ts';

export const findNextHNode = (hNode: HNode, checker: Checker) => {
  const result = findNextUp(hNode, checker);

  if (result instanceof HNode) {
    return result;
  }
};

const findNextUp = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const parent = hNode.parent;

  if (!parent) {
    return;
  }

  const childPosition = parent.children.indexOf(hNode);

  for (let i = childPosition + 1; i < parent.children.length; i++) {
    const child = parent.children[i];

    const checkerAnswer = checker(child);

    if (checkerAnswer instanceof HNode) {
      return child;
    }

    if (checkerAnswer === 'stop') {
      return 'stop';
    }

    const downAnswer = findNextDown(child, checker);

    if (downAnswer instanceof HNode) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return;
    }
  }

  if (parent instanceof HNode) {
    return;
  }

  return findNextUp(parent, checker);
};

const findNextDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  for (let i = 0; i < hNode.children.length; i++) {
    const child = hNode.children[i];

    const downAnswer = findNextDown(child, checker);

    if (downAnswer instanceof HNode) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return 'stop';
    }
  }
};
