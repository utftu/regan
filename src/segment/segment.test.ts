import {describe, expect, it} from 'bun:test';
import {djb2, getJsxPath, joinPath, SegmentEnt} from './segment.ts';

const createSegmentEnt = (name: string, parentSegmentEnt?: SegmentEnt) => {
  return new SegmentEnt({
    name,
    parentSegmentEnt,
    jsxNode: {} as any,
    contextEnt: undefined,
    globalCtx: {} as any,
  });
};

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

  describe('SegmentEnt', () => {
    it('хранит имя', () => {
      expect(createSegmentEnt('test').name).toBe('test');
    });

    it('путь и id не кэшируются — всегда по живой цепочке', () => {
      const segmentEnt = createSegmentEnt('test');

      expect(segmentEnt.getJsxPath()).toBe('test');
      const id = segmentEnt.getId();
      expect(segmentEnt.getId()).toBe(id);

      segmentEnt.name = 'changed';

      expect(segmentEnt.getJsxPath()).toBe('changed');
      expect(segmentEnt.getId()).not.toBe(id);
    });
  });

  describe('getJsxPath', () => {
    it('у корня это его имя', () => {
      expect(getJsxPath(createSegmentEnt('root'))).toBe('root');
    });

    it('собирается от родителя', () => {
      const parent = createSegmentEnt('parent');
      const child = createSegmentEnt('child', parent);

      expect(getJsxPath(child)).toBe('parent.child');
    });
  });
});
