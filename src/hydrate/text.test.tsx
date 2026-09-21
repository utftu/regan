import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {FC} from '../types.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {stringify} from '../regan.ts';

describe('hydrate: текстовые узлы', () => {
  describe('текстовые узлы', () => {
    it('соседние тексты разделяются и после гидратации разделителей не остаётся', () => {
      const App: FC = () => {
        return (
          <div id='holder'>
            первый{'второй'}
            <span>элемент</span>
            третий
          </div>
        );
      };

      expect(stringify(<App />)).toBe(
        '<div id="holder">первый<!---->второй<span>элемент</span>третий</div>',
      );

      const jsdom = new JSDOM();
      const root = insertAndHydrate({jsdom, jsxNode: <App />});
      const holder = root.querySelector('#holder')!;

      expect(holder.innerHTML).toBe('первыйвторой<span>элемент</span>третий');
    });

    it('пустая строка не даёт узла ни на одной стадии', () => {
      const App: FC = () => {
        return (
          <div id='holder'>
            {'a'}
            {''}
            {'b'}
          </div>
        );
      };

      expect(stringify(<App />)).toBe('<div id="holder">a<!---->b</div>');

      const jsdom = new JSDOM();
      const root = insertAndHydrate({jsdom, jsxNode: <App />});
      const holder = root.querySelector('#holder')!;

      expect(holder.innerHTML).toBe('ab');
      expect(holder.childNodes.length).toBe(2);
    });
  });
});
