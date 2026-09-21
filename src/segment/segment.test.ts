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

  describe('getNamedPath', () => {
    const createElementEnt = (
      tagName: string,
      parentSegmentEnt?: SegmentEnt,
      name = '',
    ) =>
      new SegmentEnt({
        name,
        parentSegmentEnt,
        jsxNode: {type: 'element', tagName} as any,
        contextEnt: undefined,
        globalCtx: {} as any,
      });

    const createComponentEnt = (
      component: any,
      parentSegmentEnt?: SegmentEnt,
      name = '',
    ) =>
      new SegmentEnt({
        name,
        parentSegmentEnt,
        jsxNode: {type: 'component', component} as any,
        contextEnt: undefined,
        globalCtx: {} as any,
      });

    // объявления функций, а не стрелки в const: имя стрелки, использованной
    // один раз, транспайлер может потерять, инлайнув её в вызов
    it('имена и номера среди соседей', () => {
      function App() {
        return null;
      }
      function Row() {
        return null;
      }

      const appEnt = createComponentEnt(App);
      const ulEnt = createElementEnt('ul', appEnt, '2');
      const rowEnt = createComponentEnt(Row, ulEnt, '7');
      const liEnt = createElementEnt('li', rowEnt, '0');

      expect(liEnt.getNamedPath()).toBe('<App><ul:2><Row:7><li:0>');
    });

    it('у корня номера нет', () => {
      function App() {
        return null;
      }

      expect(createComponentEnt(App).getNamedPath()).toBe('<App>');
    });

    it('у безымянного компонента заглушка', () => {
      const ent = createComponentEnt(() => null);

      expect(ent.getNamedPath()).toBe('<anonymous>');
    });
  });

  describe('displayName', () => {
    it('важнее имени функции и переживает минификацию', () => {
      // после minify имя функции превращается в что-то вроде 'e'
      const minified: any = () => null;
      minified.displayName = 'List';

      const ent = new SegmentEnt({
        name: '3',
        parentSegmentEnt: undefined,
        jsxNode: {type: 'component', component: minified} as any,
        contextEnt: undefined,
        globalCtx: {} as any,
      });

      expect(ent.getNamedPath()).toBe('<List:3>');
    });
  });
});
