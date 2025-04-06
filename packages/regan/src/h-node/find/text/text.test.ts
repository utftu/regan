import {describe, expect, it} from 'vitest';

import {
  findNextTextHNode,
  findNextTextHNodes,
  findPrevTextHNode,
  sumNextText,
} from './text.ts';
import {HNodeComponent} from '../../component.ts';
import {HNodeText} from '../../text.ts';
import {addChildren} from '../../helpers.ts';
import {createHNode, createHNodeText} from '../../../utils/tests.ts';

describe('find text', () => {
  it('findPrevTextNode', () => {
    const root = new HNodeComponent({} as any);
    const left = new HNodeText({} as any, {} as any);
    const middle = new HNodeComponent({} as any);
    const right = new HNodeText({} as any, {} as any);

    root.children = [left, middle, right];
    root.children.forEach((child) => (child.parent = root));

    expect(findPrevTextHNode(middle)).toBe(left);
  });
  it('findNextTextNode', () => {
    const root = new HNodeComponent({} as any);
    const left = new HNodeText({} as any, {} as any);
    const middle = new HNodeComponent({} as any);
    const right = new HNodeText({} as any, {} as any);

    root.children = [left, middle, right];
    root.children.forEach((child) => (child.parent = root));

    expect(findNextTextHNode(middle)).toBe(right);
  });

  it('sumNextText', () => {
    const root = new HNodeComponent({} as any);
    const left = new HNodeText({} as any, {text: 'Hello'} as any);
    const middle = new HNodeComponent({} as any);
    const right = new HNodeText({} as any, {text: ' '} as any);
    const right2 = new HNodeText({} as any, {text: 'World'} as any);

    addChildren(root, [left, middle, right, right2]);

    expect(sumNextText(right)).toBe(' World');
    expect(sumNextText(left)).toBe('Hello World');
  });

  describe('findNextTextHNode', () => {
    it('no next text', () => {
      const level1HNode = createHNode();
      const result = findNextTextHNodes(level1HNode);
      expect(result).toEqual([]);
    });

    it('multiple next text', () => {
      const level1_1HNode = createHNode();
      const level1_2HNode = createHNodeText('text1');
      const level1_3HNode = createHNodeText('text2');
      const level0HNode = createHNode();
      addChildren(level0HNode, [level1_1HNode, level1_2HNode, level1_3HNode]);
      const result = findNextTextHNodes(level1_1HNode);
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('text1');
      expect(result[1].text).toBe('text2');
    });
  });
});
