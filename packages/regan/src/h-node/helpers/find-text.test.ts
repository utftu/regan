import {describe, expect, it} from 'vitest';
import {HNodeComponent} from '../component.ts';
import {HNodeText} from '../text.ts';
import {
  findNextTextHNode,
  // findNextTextHNodes,
  findPrevTextHNode,
} from './find-text.ts';

describe('h-node/helpers/find-text', () => {
  it('findPrevTextNode', () => {
    const root = new HNodeComponent({} as any);
    const left = new HNodeText({} as any, {} as any);
    const middle = new HNodeComponent({} as any);
    const right = new HNodeText({} as any, {} as any);

    root.children = [left, middle, right];
    root.children.forEach((child) => (child.parent = root));

    expect(findPrevTextHNode(middle)).toBe(left);
  });
  it.only('findNextTextNode', () => {
    const root = new HNodeComponent({} as any);
    const left = new HNodeText({} as any, {} as any);
    const middle = new HNodeComponent({} as any);
    const right = new HNodeText({} as any, {} as any);

    root.children = [left, middle, right];
    root.children.forEach((child) => (child.parent = root));

    expect(findNextTextHNode(middle)).toBe(right);
  });
  // it('findNextTextNodes', () => {
  //   const root = new HNodeComponent({} as any);
  //   const left = new HNodeText({} as any, {} as any);
  //   const middle = new HNodeComponent({} as any);
  //   const right = new HNodeText({} as any, {} as any);
  //   const right2 = new HNodeText({} as any, {} as any);

  //   root.children = [left, middle, right, right2];
  //   root.children.forEach((child) => (child.parent = root));

  //   const nextTextNodes = findNextTextHNodes(middle);
  //   expect(nextTextNodes.length).toBe(2);
  //   expect(nextTextNodes[0]).toBe(right);
  //   expect(nextTextNodes[1]).toBe(right2);
  // });
});
