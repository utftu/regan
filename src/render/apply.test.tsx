import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from './render.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);

  render(root, jsxNode, {window: jsdom.window as any});

  return root;
};

const ids = (holder: Element) =>
  Array.from(holder.children).map((child) => child.id);

describe('apply: сопоставление по позиции', () => {
  it('переиспользует dom-узел на том же месте', async () => {
    const text = createAtom('раз');

    const App: FC = () => <div id='holder'>{text}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const before = holder.firstChild;

    text.set('два');
    await waitTime(0);

    expect(holder.firstChild).toBe(before);
    expect(holder.textContent).toBe('два');
  });

  it('текст заменяется элементом и обратно, соседи не страдают', async () => {
    const value = createAtom<any>('текст');

    const App: FC = () => (
      <div id='holder'>
        <i id='before' />
        {value}
        <b id='after' />
      </div>
    );

    const holder = setup(<App />).querySelector('#holder')!;
    const before = holder.querySelector('#before');
    const after = holder.querySelector('#after');

    value.set(<span id='mid'>разметка</span>);
    await waitTime(0);

    expect(ids(holder)).toEqual(['before', 'mid', 'after']);
    expect(holder.querySelector('#before')).toBe(before);
    expect(holder.querySelector('#after')).toBe(after);

    value.set('снова текст');
    await waitTime(0);

    expect(ids(holder)).toEqual(['before', 'after']);
    expect(holder.textContent).toBe('снова текст');
  });

  it('пропы добавляются, меняются и удаляются', async () => {
    const value = createAtom<any>(<span id='x' class='a' title='t' />);

    const App: FC = () => <div id='holder'>{value}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const span = holder.querySelector('#x')!;

    value.set(<span id='x' class='b' lang='ru' />);
    await waitTime(0);

    expect(holder.querySelector('#x')).toBe(span);
    expect(span.getAttribute('class')).toBe('b');
    expect(span.getAttribute('lang')).toBe('ru');
    expect(span.hasAttribute('title')).toBe(false);
  });

  it('обработчик события подменяется, старый больше не зовётся', async () => {
    const calls: string[] = [];
    const value = createAtom<any>(
      <button id='b' click={() => calls.push('первый')} />,
    );

    const App: FC = () => <div id='holder'>{value}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const button = holder.querySelector('#b')! as HTMLElement;

    button.click();

    value.set(<button id='b' click={() => calls.push('второй')} />);
    await waitTime(0);

    expect(holder.querySelector('#b')).toBe(button);
    button.click();

    expect(calls).toEqual(['первый', 'второй']);
  });
});

describe('apply: сопоставление по ключу', () => {
  it('перестановка переносит те же dom-узлы', async () => {
    const list = createAtom<any>([
      <span key='a' id='a' />,
      <span key='b' id='b' />,
      <span key='c' id='c' />,
    ]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const [a, b, c] = [
      holder.querySelector('#a'),
      holder.querySelector('#b'),
      holder.querySelector('#c'),
    ];

    list.set([
      <span key='c' id='c' />,
      <span key='a' id='a' />,
      <span key='b' id='b' />,
    ]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['c', 'a', 'b']);
    expect(holder.querySelector('#a')).toBe(a);
    expect(holder.querySelector('#b')).toBe(b);
    expect(holder.querySelector('#c')).toBe(c);
  });

  it('вставка в начало не трогает существующие узлы', async () => {
    const list = createAtom<any>([
      <span key='a' id='a' />,
      <span key='b' id='b' />,
    ]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const a = holder.querySelector('#a');
    const b = holder.querySelector('#b');

    list.set([
      <span key='new' id='new' />,
      <span key='a' id='a' />,
      <span key='b' id='b' />,
    ]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['new', 'a', 'b']);
    expect(holder.querySelector('#a')).toBe(a);
    expect(holder.querySelector('#b')).toBe(b);
  });

  it('удаление из середины убирает ровно один узел', async () => {
    const list = createAtom<any>([
      <span key='a' id='a' />,
      <span key='b' id='b' />,
      <span key='c' id='c' />,
    ]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const a = holder.querySelector('#a');
    const c = holder.querySelector('#c');

    list.set([<span key='a' id='a' />, <span key='c' id='c' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['a', 'c']);
    expect(holder.querySelector('#a')).toBe(a);
    expect(holder.querySelector('#c')).toBe(c);
  });

  it('состояние dom переживает перестановку', async () => {
    const list = createAtom<any>([
      <input key='a' id='a' />,
      <input key='b' id='b' />,
    ]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const inputA = holder.querySelector('#a') as HTMLInputElement;
    inputA.value = 'напечатано';

    list.set([<input key='b' id='b' />, <input key='a' id='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['b', 'a']);
    expect((holder.querySelector('#a') as HTMLInputElement).value).toBe(
      'напечатано',
    );
  });

  it('компонент из нескольких узлов переезжает целиком', async () => {
    const Row: FC<{name: string}> = ({name}) => [
      <span id={`${name}-1`}>{name}1</span>,
      <span id={`${name}-2`}>{name}2</span>,
    ];

    const list = createAtom<any>([
      <Row key='a' name='a' />,
      <Row key='b' name='b' />,
    ]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const a1 = holder.querySelector('#a-1');
    const a2 = holder.querySelector('#a-2');

    list.set([<Row key='b' name='b' />, <Row key='a' name='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['b-1', 'b-2', 'a-1', 'a-2']);
    expect(holder.querySelector('#a-1')).toBe(a1);
    expect(holder.querySelector('#a-2')).toBe(a2);
  });

  it('после гидратации ключи тоже работают', async () => {
    const list = createAtom<any>([
      <span key='a' id='a' />,
      <span key='b' id='b' />,
    ]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const holder = root.querySelector('#holder')!;

    const a = holder.querySelector('#a');
    const b = holder.querySelector('#b');

    list.set([<span key='b' id='b' />, <span key='a' id='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['b', 'a']);
    expect(holder.querySelector('#a')).toBe(a);
    expect(holder.querySelector('#b')).toBe(b);
  });

  it('без ключей перестановка сопоставляется по позиции', async () => {
    const list = createAtom<any>([<span id='a' />, <span id='b' />]);

    const App: FC = () => <div id='holder'>{list}</div>;

    const holder = setup(<App />).querySelector('#holder')!;
    const first = holder.children[0];

    list.set([<span id='b' />, <span id='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['b', 'a']);
    // тот же узел на том же месте, у него поменялся только id
    expect(holder.children[0]).toBe(first);
  });
});
