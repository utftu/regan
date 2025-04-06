import {describe, it, expect, vi} from 'vitest';
import {HNode} from '../h-node.ts';
import {findNextHNode} from './next.ts';
import {HNodeElement} from '../element.ts';
import {addChildren} from '../helpers.ts';

const createHNode = () => {
  return new HNode({} as any);
};

const createHNodeElement = () => {
  return new HNodeElement({} as any, {} as any);
};

describe('findNextHNode', () => {
  it('no next node', () => {
    const level1HNode = createHNode();
    const checker = vi.fn(() => false) as any;
    const result = findNextHNode(level1HNode, checker);
    expect(result).toBeUndefined();
  });

  it('next sibling', () => {
    const level1_1HNode = createHNode();
    const level1_2HNode = createHNode();
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1_1HNode, level1_2HNode]);
    const checker = vi.fn((node) => (node === level1_2HNode ? node : false));
    const result = findNextHNode(level1_1HNode, checker);
    expect(result).toBe(level1_2HNode);
  });

  it('parent HNodeElement', () => {
    const level1HNode = createHNode();
    const level0HNode = createHNodeElement();
    addChildren(level0HNode, [level1HNode]);
    const checker = vi.fn(() => false) as any;
    const result = findNextHNode(level1HNode, checker);
    expect(result).toBeUndefined();
  });

  it('stop condition', () => {
    const level1_1HNode = createHNode();
    const level1_2HNode = createHNode();
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1_1HNode, level1_2HNode]);
    const checker = vi.fn(() => 'stop');
    const result = findNextHNode(level1_1HNode, checker as any);
    expect(result).toBeUndefined();
  });

  it('deeper next siblings', () => {
    const level3HNode = createHNode();
    const level2HNode = createHNode();
    const level1_1HNode = createHNode();
    const level1_2HNode = createHNode();
    addChildren(level2HNode, [level3HNode]);
    addChildren(level1_2HNode, [level2HNode]);
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1_1HNode, level1_2HNode]);
    const checker = vi.fn((node) => (node === level3HNode ? node : undefined));
    const result = findNextHNode(level1_1HNode, checker);
    expect(result).not.toBe(undefined);
  });
});
