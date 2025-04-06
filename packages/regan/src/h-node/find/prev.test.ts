import {describe, it, expect, vi} from 'vitest';
import {findPrevHNode} from './your-file'; // adjust the import path
import {HNode} from '../h-node.ts';

const createHNode = () => {
  return new HNode({} as any);
};

describe('findPrevHNode', () => {
  it.only('should return undefined when no previous node is found', () => {
    const hNode = createHNode();
    const checker = vi.fn(() => false);
    const result = findPrevHNode(hNode, checker);
    expect(result).toBeUndefined();
  });

  it('should return HNode when found in previous sibling', () => {
    const targetNode = new TestHNode();
    const hNode = new TestHNode();
    const parent = new TestHNode([targetNode, hNode]);
    const checker = vi.fn((node) => (node === targetNode ? node : false));
    const result = findPrevHNode(hNode, checker);
    expect(result).toBe(targetNode);
  });

  it('should return undefined when parent is HNodeElement', () => {
    const hNode = new TestHNode();
    new TestHNodeElement([hNode]); // parent is HNodeElement
    const checker = vi.fn(() => false);
    const result = findPrevHNode(hNode, checker);
    expect(result).toBeUndefined();
  });

  it('should respect stop condition from checker', () => {
    const hNode = new TestHNode();
    const prevNode = new TestHNode();
    new TestHNode([prevNode, hNode]);
    const checker = vi.fn(() => 'stop');
    const result = findPrevHNode(hNode, checker);
    expect(result).toBeUndefined();
  });

  it('should find node in deeper previous siblings', () => {
    const targetNode = new TestHNode();
    const deepNode = new TestHNode([targetNode]);
    const prevNode = new TestHNode([deepNode]);
    const hNode = new TestHNode();
    new TestHNode([prevNode, hNode]);
    const checker = vi.fn((node) => (node === targetNode ? node : false));
    const result = findPrevHNode(hNode, checker);
    expect(result).toBe(targetNode);
  });

  it('should update config.lastParentHNode', () => {
    const hNode = new TestHNode();
    const parent = new TestHNode([hNode]);
    const checker = vi.fn(() => false);
    const config = {};
    findPrevHNode(hNode, checker, config);
    expect(config.lastParentHNode).toBe(parent);
  });
});
