import {HNodeElement} from '../element.ts';
import {HNode} from '../h-node.ts';

const detectElemParentIndex = (el: HTMLElement): number => {
  const parent = el.parentNode!;
  for (let i = 0; i <= parent.children.length; i++) {
    const currEl = parent.children[i];
    if (currEl === el) {
      return i;
    }
  }
  return undefined as any as number;
};

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

const findParentHNodeElement = (hNode: HNode): HNodeElement | void => {
  if (hNode instanceof HNodeElement) {
    return hNode;
  }

  if (!hNode.parent) {
    return;
  }

  return findParentHNodeElement(hNode.parent);
};

export const findPrevElement = (hNode: HNode) => {
  const hNodeElement = findParentHNodeElement(hNode);

  if (!hNodeElement) {
    return;
  }

  const parentIndex = detectElemParentIndex(hNodeElement.el);

  console.log('-----', 'parentIndex', parentIndex);

  if (parentIndex === 0) {
    return;
  }

  console.log('-----', 'hNodeElement.el', hNodeElement.el);

  return hNodeElement.el.parentNode?.childNodes[parentIndex - 1];

  // if (!hNodeElement.parent) {
  //   return;
  // }

  // return up(hNodeElement.parent, hNode.jsxSegment.parent!.position);
};
