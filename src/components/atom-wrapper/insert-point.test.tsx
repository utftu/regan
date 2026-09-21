import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from '../../render/render.ts';
import {FC} from '../../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);

  render(root, jsxNode, {window: jsdom.window as any});

  return root;
};

// Динамическая область должна попадать ровно на своё место, а не в начало
// родителя и не в чужой элемент. Тут проверяются все ветки поиска.
describe('куда вставляется динамическая область', () => {
  it('первый ребёнок элемента: слева ничего нет', async () => {
    const value = createAtom<any>(null);

    const App: FC = () => (
      <div id='holder'>
        {value}
        <span id='after' />
      </div>
    );

    const holder = setup(<App />).querySelector('#holder')!;

    value.set(<b id='b' />);
    await waitTime(0);

    expect(Array.from(holder.children).map((c) => c.id)).toEqual([
      'b',
      'after',
    ]);
  });

  it('между двумя элементами', async () => {
    const value = createAtom<any>(null);

    const App: FC = () => (
      <div id='holder'>
        <span id='before' />
        {value}
        <span id='after' />
      </div>
    );

    const holder = setup(<App />).querySelector('#holder')!;

    value.set(<b id='b' />);
    await waitTime(0);

    expect(Array.from(holder.children).map((c) => c.id)).toEqual([
      'before',
      'b',
      'after',
    ]);
  });

  it('слева компонент без dom — смотрим глубже', async () => {
    const value = createAtom<any>(null);

    const Empty: FC = () => null;
    const Deep: FC = () => (
      <>
        <span id='deep' />
      </>
    );

    const App: FC = () => (
      <div id='holder'>
        <Deep />
        <Empty />
        {value}
      </div>
    );

    const holder = setup(<App />).querySelector('#holder')!;

    value.set(<b id='b' />);
    await waitTime(0);

    expect(Array.from(holder.children).map((c) => c.id)).toEqual(['deep', 'b']);
  });

  it('две динамические области рядом не мешают друг другу', async () => {
    const first = createAtom<any>(null);
    const second = createAtom<any>(null);

    const App: FC = () => (
      <div id='holder'>
        {first}
        {second}
      </div>
    );

    const holder = setup(<App />).querySelector('#holder')!;

    second.set(<b id='second' />);
    await waitTime(0);
    first.set(<i id='first' />);
    await waitTime(0);

    expect(Array.from(holder.children).map((c) => c.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('область в корне, выше элементов нет', async () => {
    const value = createAtom<any>('раз');

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <>{value}</>, {window: jsdom.window as any});

    expect(root.textContent).toBe('раз');

    value.set(<b id='b' />);
    await waitTime(0);

    expect(root.querySelector('#b')).not.toBe(null);
  });
});
