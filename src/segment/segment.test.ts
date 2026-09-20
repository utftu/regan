import {describe, expect, it} from 'bun:test';
import {PathSegment, getJsxPath, joinPath, djb2} from './segment.ts';
import {SegmentEnt} from './segment.ts';

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

    it('путь и id не кэшируются — всегда по живой цепочке', () => {
      const mockSegmentEnt = {parentSegmentEnt: undefined} as SegmentEnt;
      const segment = new PathSegment({name: 'test', systemEnt: mockSegmentEnt});

      expect(segment.getJsxPath()).toBe('test');
      const id = segment.getId();
      expect(segment.getId()).toBe(id);

      segment.name = 'changed';

      expect(segment.getJsxPath()).toBe('changed');
      expect(segment.getId()).not.toBe(id);
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
