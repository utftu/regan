import {describe, expect, it} from 'vitest';
import {PathSegment, getJsxPath, joinPath, djb2} from './jsx-path.ts';
import {SegmentEnt} from '../segment.ts';

describe('jsx-path', () => {
  describe('joinPath', () => {
    it('joins two parts', () => {
      expect(joinPath('a', 'b')).toBe('a.b');
    });

    it('returns second if first empty', () => {
      expect(joinPath('', 'b')).toBe('b');
    });

    it('returns first if second empty', () => {
      expect(joinPath('a', '')).toBe('a');
    });

    it('returns empty if both empty', () => {
      expect(joinPath('', '')).toBe('');
    });
  });

  describe('djb2', () => {
    it('returns consistent hash', () => {
      const hash1 = djb2('test');
      const hash2 = djb2('test');
      expect(hash1).toBe(hash2);
    });

    it('returns different hash for different strings', () => {
      const hash1 = djb2('test1');
      const hash2 = djb2('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('returns string', () => {
      expect(typeof djb2('test')).toBe('string');
    });
  });

  describe('PathSegment', () => {
    it('stores name', () => {
      const mockSegmentEnt = {} as SegmentEnt;
      const segment = new PathSegment({name: 'test', systemEnt: mockSegmentEnt});
      expect(segment.name).toBe('test');
    });

    it('caches jsxPath', () => {
      const mockSegmentEnt = {parentSegmentEnt: undefined} as SegmentEnt;
      const segment = new PathSegment({name: 'test', systemEnt: mockSegmentEnt});
      
      const path1 = segment.getJsxPath();
      const path2 = segment.getJsxPath();
      
      expect(path1).toBe(path2);
      expect(path1).toBe('test');
    });

    it('caches id', () => {
      const mockSegmentEnt = {parentSegmentEnt: undefined} as SegmentEnt;
      const segment = new PathSegment({name: 'test', systemEnt: mockSegmentEnt});
      
      const id1 = segment.getId();
      const id2 = segment.getId();
      
      expect(id1).toBe(id2);
    });

    it('clearCache resets cache', () => {
      const mockSegmentEnt = {parentSegmentEnt: undefined} as SegmentEnt;
      const segment = new PathSegment({name: 'test', systemEnt: mockSegmentEnt});
      
      segment.getJsxPath();
      segment.getId();
      
      segment.name = 'changed';
      segment.clearCache();
      
      expect(segment.getJsxPath()).toBe('changed');
    });
  });

  describe('getJsxPath', () => {
    it('returns name for root segment', () => {
      const mockSegmentEnt = {parentSegmentEnt: undefined} as SegmentEnt;
      const segment = new PathSegment({name: 'root', systemEnt: mockSegmentEnt});
      
      expect(getJsxPath(segment)).toBe('root');
    });

    it('builds path from parent', () => {
      const parentSegmentEnt = {parentSegmentEnt: undefined} as SegmentEnt;
      const parentSegment = new PathSegment({name: 'parent', systemEnt: parentSegmentEnt});
      (parentSegmentEnt as any).pathSegment = parentSegment;

      const childSegmentEnt = {parentSegmentEnt} as SegmentEnt;
      const childSegment = new PathSegment({name: 'child', systemEnt: childSegmentEnt});
      
      expect(getJsxPath(childSegment)).toBe('parent.child');
    });
  });
});
