import {describe, expect, it, vi} from 'vitest';
import {mountHNodes, unmountHNodes, addChildren, detachChildren} from './helpers.ts';
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

describe('helpers', () => {
  describe('mountHNodes', () => {
    it('mounts node and children recursively', () => {
      const mount1 = vi.fn();
      const mount2 = vi.fn();
      const mount3 = vi.fn();
      
      const child = createMockHNode({mounts: [mount3]});
      const parent = createMockHNode({mounts: [mount1, mount2], children: [child]});
      
      mountHNodes(parent);
      
      expect(mount1).toHaveBeenCalled();
      expect(mount2).toHaveBeenCalled();
      expect(mount3).toHaveBeenCalled();
    });

    it('mounts in correct order (parent first)', () => {
      const order: string[] = [];
      
      const child = createMockHNode({mounts: [() => order.push('child')]});
      const parent = createMockHNode({
        mounts: [() => order.push('parent')],
        children: [child],
      });
      
      mountHNodes(parent);
      
      expect(order).toEqual(['parent', 'child']);
    });
  });

  describe('unmountHNodes', () => {
    it('unmounts node and children recursively', () => {
      const unmount1 = vi.fn();
      const unmount2 = vi.fn();
      
      const child = createMockHNode({unmounts: [unmount2]});
      const parent = createMockHNode({unmounts: [unmount1], children: [child]});
      
      unmountHNodes(parent);
      
      expect(unmount1).toHaveBeenCalled();
      expect(unmount2).toHaveBeenCalled();
    });

    it('sets unmounted flag on all nodes', () => {
      const child = createMockHNode();
      const parent = createMockHNode({children: [child]});
      
      unmountHNodes(parent);
      
      expect(parent.unmounted).toBe(true);
      expect(child.unmounted).toBe(true);
    });
  });

  describe('addChildren', () => {
    it('adds children to parent', () => {
      const parent = createMockHNode();
      const child1 = createMockHNode();
      const child2 = createMockHNode();
      
      addChildren(parent, [child1, child2]);
      
      expect(parent.children).toContain(child1);
      expect(parent.children).toContain(child2);
    });

    it('sets parent reference', () => {
      const parent = createMockHNode();
      const child = createMockHNode();
      
      addChildren(parent, [child]);
      
      expect(child.parent).toBe(parent);
    });
  });

  describe('detachChildren', () => {
    it('removes all children', () => {
      const child1 = createMockHNode();
      const child2 = createMockHNode();
      const parent = createMockHNode({children: [child1, child2]});
      
      child1.parent = parent;
      child2.parent = parent;
      
      detachChildren(parent);
      
      expect(parent.children.length).toBe(0);
    });

    it('unmounts children', () => {
      const unmount = vi.fn();
      const child = createMockHNode({unmounts: [unmount]});
      const parent = createMockHNode({children: [child]});
      
      child.parent = parent;
      
      detachChildren(parent);
      
      expect(unmount).toHaveBeenCalled();
    });

    it('clears parent reference', () => {
      const child = createMockHNode();
      const parent = createMockHNode({children: [child]});
      
      child.parent = parent;
      
      detachChildren(parent);
      
      expect(child.parent).toBeUndefined();
    });

    it('detaches nested children recursively', () => {
      const grandchild = createMockHNode();
      const child = createMockHNode({children: [grandchild]});
      const parent = createMockHNode({children: [child]});
      
      grandchild.parent = child;
      child.parent = parent;
      
      detachChildren(parent);
      
      expect(child.children.length).toBe(0);
    });
  });
});
