import {HNodeElement} from '../element.ts';
import {HNode} from '../h-node.ts';
import {Checker, CheckerAnswer} from './find.ts';

export const findNextHNode = (hNode: HNode, checker: Checker) => {
  const result = findNextUp(hNode, checker);

  if (result instanceof HNode) {
    return result;
  }
};

const findNextUp = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const checkingHNode = hNode.parent;

  if (!checkingHNode) {
    return;
  }

  const childPosition = checkingHNode.children.indexOf(hNode);

  for (let i = childPosition + 1; i < checkingHNode.children.length; i++) {
    const child = checkingHNode.children[i];

    const downAnswer = findNextDown(child, checker);

    if (downAnswer instanceof HNode) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return;
    }
  }

  if (checkingHNode instanceof HNodeElement) {
    return;
  }

  return findNextUp(checkingHNode, checker);
};

const findNextDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const checkerAnswer = checker(hNode);

  if (checkerAnswer instanceof HNode) {
    return hNode;
  }

  if (checkerAnswer === 'stop') {
    return 'stop';
  }

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
