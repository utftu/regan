import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {insertAndHydrate} from '../utils/tests.ts';
import {FC} from '../types.ts';

describe('обновление гидрированного дерева', () => {
  it('гидрированный элемент патчится на месте, а не пересоздаётся', async () => {
    const content = createAtom<any>(<div id='box' class='первый' title='t' />);

    const App: FC = () => <div id='holder'>{content}</div>;

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});

    const before = root.querySelector('#box')!;
    expect(before.getAttribute('class')).toBe('первый');

    content.set(<div id='box' class='второй' />);
    await waitTime(0);

    const after = root.querySelector('#box')!;

    // тот же самый DOM-узел: диф прочитал tag и props из гидрированного HNode
    expect(after).toBe(before);
    expect(after.getAttribute('class')).toBe('второй');
    expect(after.getAttribute('title')).toBe(null);
  });

  it('смена тега заменяет гидрированный элемент', async () => {
    const content = createAtom<any>(<div id='box'>текст</div>);

    const App: FC = () => <div id='holder'>{content}</div>;

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const before = root.querySelector('#box')!;

    content.set(<span id='box'>текст</span>);
    await waitTime(0);

    const after = root.querySelector('#box')!;

    expect(after).not.toBe(before);
    expect(after.tagName.toLowerCase()).toBe('span');
  });
});
