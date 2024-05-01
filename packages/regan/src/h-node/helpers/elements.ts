import {HNodeElement} from '../element.ts';
import {HNode} from '../h-node.ts';

const down = (
  hNodes: HNode[],
  stopIteratePosition: number = 0
): HTMLElement | void => {
  for (let i = hNodes.length - 1; i > stopIteratePosition; i--) {
    const childHNode = hNodes[i];

    if (childHNode instanceof HNodeElement) {
      return childHNode.el;
    }

    const possibleEl = down(childHNode.children);

    if (possibleEl) {
      return possibleEl;
    }
  }
};

const up = (
  hNode: HNode,
  stopIteratePosition: number = 0
): HTMLElement | void => {
  const possibleDownEl = down(hNode.children, stopIteratePosition);
  if (possibleDownEl) {
    return possibleDownEl;
  }

  if (!hNode.parent) {
    return;
  }

  const possibleUpEl = up(hNode.parent, hNode.jsxSegment.parent!.position);
  if (possibleUpEl) {
    return possibleUpEl;
  }
};

export const findParentElement = (hNode: HNode): HTMLElement | void => {
  if (hNode instanceof HNodeElement) {
    return hNode.el;
  }

  if (!hNode.parent) {
    return;
  }

  return findParentElement(hNode.parent);
};

export const findPrevElement = (hNode: HNode) => {
  if (!hNode.parent) {
    return;
  }

  return up(hNode.parent, hNode.jsxSegment.parent!.position);
};
