import {HNodeElement} from '../element.ts';
import {HNode} from '../h-node.ts';
import {HNodeText} from '../text.ts';

const findTextNodeDown = (hNode: HNode): HNodeText | void => {
  if (hNode instanceof HNodeText) {
    return hNode;
  }

  if (hNode instanceof HNodeElement) {
    return;
  }

  for (const child of hNode.children) {
    const result = findTextNodeDown(child);

    if (result) {
      return result;
    }
  }
};

const findTextNodeUp = (hNode: HNode) => {
  const parent = hNode.parent;

  if (!parent) {
    return;
  }

  const childPosition = parent.children.indexOf(hNode);

  for (let i = childPosition + 1; i < parent.children.length; i++) {
    const child = parent.children[i];

    const possibleTextNode = findTextNodeDown(child);

    if (possibleTextNode) {
      return possibleTextNode;
    }
  }

  return findTextNodeUp(parent);
};

export const findNextTextHNode = (hNode: HNode) => {
  return findTextNodeUp(hNode);
};

const findTextNodeUpReverse = (hNode: HNode) => {
  const parent = hNode.parent;

  if (!parent) {
    return;
  }

  const childPosition = parent.children.indexOf(hNode);

  for (let i = childPosition - 1; i >= 0; i--) {
    const child = parent.children[i];

    const possibleTextNode = findTextNodeDown(child);

    if (possibleTextNode) {
      return possibleTextNode;
    }
  }

  return findTextNodeUpReverse(parent);
};

export const findPrevTextHNode = (hNode: HNode) => {
  return findTextNodeUpReverse(hNode);
};

export const findNextTextHNodes = (hNode: HNode) => {
  const nodes = [];
  let nextNode = findNextTextHNode(hNode);
  while (nextNode) {
    nodes.push(nextNode);
    nextNode = findNextTextHNode(nextNode);
  }
  return nodes;
};
