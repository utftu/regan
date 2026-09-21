import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);

  render(root, jsxNode, {window: jsdom.window as any});

  return root;
};

describe('разбор детей', () => {
  it('ребёнок неизвестного вида — ошибка с типом и местом', () => {
    const Inner: FC = () => <div>{{a: 1} as any}</div>;
    const List: FC = () => (
      <ul>
        <li />
        <Inner />
      </ul>
    );
    const App: FC = () => (
      <div>
        <List />
      </div>
    );

    expect(() => setup(<App />)).toThrow('Invalid child of type object');
    // место названо именами, а не индексами
    expect(() => setup(<App />)).toThrow(
      'in <App><div:0><List:0><ul:0><Inner:1><div:0>',
    );
  });

  it('symbol не ломает саму ошибку', () => {
    const App: FC = () => <div>{Symbol('нельзя') as any}</div>;

    expect(() => stringify(<App />)).toThrow('Invalid child of type symbol');

    const jsdom = new JSDOM();
    expect(() => insertAndHydrate({jsdom, jsxNode: <App />})).toThrow(
      'Invalid child of type symbol',
    );
  });

  it('пропускаемые значения не дают узлов и одинаковы на стадиях', () => {
    const App: FC = () => (
      <div id='holder'>
        {null}
        {undefined}
        {false}
        {true}
        {''}
        конец
      </div>
    );

    expect(stringify(<App />)).toBe('<div id="holder">конец</div>');

    const holder = setup(<App />).querySelector('#holder')!;
    expect(holder.childNodes.length).toBe(1);
    expect(holder.textContent).toBe('конец');
  });

  it('ноль это текст, а не пропускаемое значение', () => {
    const App: FC = () => <div id='holder'>{0}</div>;

    expect(stringify(<App />)).toBe('<div id="holder">0</div>');
    expect(setup(<App />).querySelector('#holder')!.textContent).toBe('0');
  });

  it('функция-ребёнок вызывается', () => {
    const App: FC = () => <div id='holder'>{() => 'из функции'}</div>;

    expect(setup(<App />).querySelector('#holder')!.textContent).toBe(
      'из функции',
    );
  });

  it('вложенные массивы разворачиваются', () => {
    const App: FC = () => (
      <div id='holder'>{[['раз', 'два'], ['три']] as any}</div>
    );

    expect(setup(<App />).querySelector('#holder')!.textContent).toBe(
      'раздватри',
    );
  });

  it('атом среди детей заворачивается сам, без AtomWrapper', () => {
    const value = createAtom('раз');

    const App: FC = () => <div id='holder'>{value}</div>;

    expect(setup(<App />).querySelector('#holder')!.textContent).toBe('раз');
  });
});
