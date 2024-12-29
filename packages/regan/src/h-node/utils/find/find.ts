import {HNodeElement} from '../../element.ts';
import {HNode, HNodeBase} from '../../h-node.ts';

type CheckerAnswer = HNode | 'stop' | void;

type Checker = (hNode: HNode) => HNode | 'stop' | void;

export const findPrevHNode = (hNode: HNode, checker: Checker) => {
  const result = findPrevUp(hNode, checker);

  if (result instanceof HNodeBase) {
    return result;
  }
};

export const findNextHNode = (hNode: HNode, checker: Checker) => {
  const result = findNextUp(hNode, checker);

  if (result instanceof HNodeBase) {
    return result;
  }
};

export const findNextNoes = () => {};

// not check hNode
const findPrevDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  for (let i = hNode.children.length - 1; i > 0; i--) {
    const child = hNode.children[i];

    const downAnswer = findPrevDown(child, checker);

    if (downAnswer instanceof HNodeBase) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return 'stop';
    }
  }
};

const findNextDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  for (let i = 0; i < hNode.children.length; i++) {
    const child = hNode.children[i];

    const downAnswer = findPrevDown(child, checker);

    if (downAnswer instanceof HNodeBase) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return 'stop';
    }
  }
};

// check hNode
const findPrevUp = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const parent = hNode.parent;

  if (!parent) {
    return;
  }

  const childPosition = parent.children.indexOf(hNode);

  for (let i = childPosition - 1; i >= 0; i--) {
    const child = parent.children[i];

    const checkerAnswer = checker(child);

    if (checkerAnswer instanceof HNodeBase) {
      return child;
    }

    if (checkerAnswer === 'stop') {
      return 'stop';
    }

    const downAnswer = findPrevDown(child, checker);
    if (downAnswer instanceof HNodeBase) {
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

const findNextUp = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const parent = hNode.parent;

  if (!parent) {
    return;
  }

  const childPosition = parent.children.indexOf(hNode);

  for (let i = childPosition + 1; i < parent.children.length; i++) {
    const child = parent.children[i];

    const checkerAnswer = checker(child);

    if (checkerAnswer instanceof HNodeBase) {
      return child;
    }

    if (checkerAnswer === 'stop') {
      return 'stop';
    }

    const downAnswer = findNextDown(child, checker);
    if (downAnswer instanceof HNodeBase) {
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
