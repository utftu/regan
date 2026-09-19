import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {insertAndHydrate} from '../../utils/tests.ts';
import {render} from '../../render/render.ts';
import {FC} from '../../types.ts';

describe('текстовый атом рядом со статическим текстом', () => {
  it('гидратация убирает разделитель и обновление не трогает соседей', async () => {
    const name = createAtom('Алексей');

    const App: FC = () => {
      return <div id='holder'>Меня зовут {name}, привет</div>;
    };

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const holder = root.querySelector('#holder')!;

    expect(holder.textContent).toBe('Меня зовут Алексей, привет');
    expect(holder.innerHTML).not.toContain('<!--');

    name.set('Иван');
    await waitTime(0);

    expect(holder.textContent).toBe('Меня зовут Иван, привет');
    expect(holder.innerHTML).not.toContain('<!--');
  });

  it('атом может стать разметкой и вернуться в текст', async () => {
    const value = createAtom<any>('текст');

    const App: FC = () => {
      return <div id='holder'>до {value} после</div>;
    };

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const holder = root.querySelector('#holder')!;

    expect(holder.textContent).toBe('до текст после');

    value.set(<span id='inner'>разметка</span>);
    await waitTime(0);

    expect(holder.querySelector('#inner')!.textContent).toBe('разметка');
    expect(holder.textContent).toBe('до разметка после');

    value.set('снова текст');
    await waitTime(0);

    expect(holder.querySelector('#inner')).toBe(null);
    expect(holder.textContent).toBe('до снова текст после');
  });
  it('на клиентском рендере без гидратации работает так же', async () => {
    const name = createAtom('Алексей');

    const App: FC = () => {
      return <div id='holder'>Меня зовут {name}, привет</div>;
    };

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <App />, {window: jsdom.window as any});

    const holder = root.querySelector('#holder')!;

    expect(holder.textContent).toBe('Меня зовут Алексей, привет');

    name.set('Иван');
    await waitTime(0);

    expect(holder.textContent).toBe('Меня зовут Иван, привет');
    expect(holder.innerHTML).not.toContain('<!--');
  });
});
