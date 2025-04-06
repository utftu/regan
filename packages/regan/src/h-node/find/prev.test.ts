import {describe, it, expect, vi} from 'vitest';
import {HNode} from '../h-node.ts';
import {findPrevHNode} from './prev.ts';
import {HNodeElement} from '../element.ts';
import {HNodeText} from '../text.ts';
import {addChildren} from '../helpers.ts';
import {Config} from './find.ts';

const createHNode = () => {
  return new HNode({} as any);
};

const createHNodeElement = () => {
  return new HNodeElement({} as any, {} as any);
};

describe('findPrevHNode', () => {
  it('no prev node', () => {
    const level1HNode = createHNode();
    const checker = vi.fn(() => false) as any;
    const result = findPrevHNode(level1HNode, checker);
    expect(result).toBeUndefined();
  });

  it('prev sibling', () => {
    const level1_1HNode = createHNode();
    const level1_2HNode = createHNode();
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1_1HNode, level1_2HNode]);
    const checker = vi.fn((node) => (node === level1_1HNode ? node : false));
    const result = findPrevHNode(level1_2HNode, checker);
    expect(result).toBe(level1_1HNode);
  });

  it('parent HNodeElement', () => {
    const level1HNode = createHNode();
    const level0HNode = createHNodeElement();
    addChildren(level0HNode, [level1HNode]);
    const checker = vi.fn(() => false) as any;
    const result = findPrevHNode(level1HNode, checker);
    expect(result).toBeUndefined();
  });

  it('stop condition', () => {
    const level1_1HNode = createHNode();
    const level1_2HNode = createHNode();
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1_1HNode, level1_2HNode]);
    const checker = vi.fn(() => 'stop');
    const result = findPrevHNode(level1_2HNode, checker as any);
    expect(result).toBeUndefined();
  });

  it('deeper prev siblings', () => {
    const level3HNode = createHNode();
    const level2HNode = createHNode();
    const level1_1HNode = createHNode();
    const level1_2HNode = createHNode();
    addChildren(level2HNode, [level3HNode]);
    addChildren(level1_1HNode, [level2HNode]);
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1_1HNode, level1_2HNode]);
    const checker = vi.fn((node) => (node === level3HNode ? node : undefined));
    const result = findPrevHNode(level1_2HNode, checker);
    expect(result).not.toBe(undefined);
  });

  it('update config', () => {
    const level1HNode = createHNode();
    const level0HNode = createHNode();
    addChildren(level0HNode, [level1HNode]);
    const checker = vi.fn(() => false) as any;
    const config: Config = {};
    findPrevHNode(level1HNode, checker, config);
    expect(config.lastParentHNode).toBe(level0HNode);
  });
});
