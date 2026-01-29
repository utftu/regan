import {describe, expect, it, vi} from 'vitest';
import {HNode} from './h-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';

const createMockHNode = (overrides = {}) => {
  return new HNode({
    globalCtx: {} as GlobalCtx,
    segmentEnt: {} as SegmentEnt,
    ...overrides,
  });
};

describe('HNode', () => {
  it('creates with default values', () => {
    const hNode = createMockHNode();
    
    expect(hNode.children).toEqual([]);
    expect(hNode.mounts).toEqual([]);
    expect(hNode.unmounts).toEqual([]);
    expect(hNode.unmounted).toBe(false);
  });

  it('mount calls all mount functions', () => {
    const mount1 = vi.fn();
    const mount2 = vi.fn();
    
    const hNode = createMockHNode({mounts: [mount1, mount2]});
    hNode.mount();
    
    expect(mount1).toHaveBeenCalledWith(hNode);
    expect(mount2).toHaveBeenCalledWith(hNode);
  });

  it('unmount calls all unmount functions', () => {
    const unmount1 = vi.fn();
    const unmount2 = vi.fn();
    
    const hNode = createMockHNode({unmounts: [unmount1, unmount2]});
    hNode.unmount();
    
    expect(unmount1).toHaveBeenCalledWith(hNode);
    expect(unmount2).toHaveBeenCalledWith(hNode);
  });

  it('unmount sets unmounted flag', () => {
    const hNode = createMockHNode();
    
    expect(hNode.unmounted).toBe(false);
    hNode.unmount();
    expect(hNode.unmounted).toBe(true);
  });

  it('addChildren adds children and sets parent', () => {
    const parent = createMockHNode();
    const child1 = createMockHNode();
    const child2 = createMockHNode();
    
    parent.addChildren([child1, child2]);
    
    expect(parent.children.length).toBe(2);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
    expect(child1.parent).toBe(parent);
    expect(child2.parent).toBe(parent);
  });

  it('data object is accessible', () => {
    const hNode = createMockHNode();
    
    hNode.data.testKey = 'testValue';
    
    expect(hNode.data.testKey).toBe('testValue');
  });

  it('parent is optional', () => {
    const hNode = createMockHNode();
    
    expect(hNode.parent).toBeUndefined();
  });

  it('parent can be set', () => {
    const parent = createMockHNode();
    const child = createMockHNode({parent});
    
    expect(child.parent).toBe(parent);
  });
});
