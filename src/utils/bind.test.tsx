import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom, select} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';
import {insertAndHydrate} from './tests.ts';
import {notBind} from './bind.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);
  render(root, jsxNode, {window: jsdom.window as any as Window});

  return root;
};

const typeIn = (input: HTMLInputElement, value: string) => {
  const window = input.ownerDocument.defaultView as any;

  input.value = value;
  input.dispatchEvent(new window.Event('input'));
};

describe('связка атома с элементом', () => {
  it('введённое попадает в атом само', () => {
    const text = createAtom('раз');
    const App: FC = () => <input id='input' value={text} />;

    const input = setup(<App />).querySelector('input')!;

    expect(input.value).toBe('раз');

    typeIn(input, 'два');

    expect(text.get()).toBe('два');
  });

  it('связь работает и в обратную сторону', async () => {
    const text = createAtom('раз');
    const App: FC = () => <input id='input' value={text} />;

    const input = setup(<App />).querySelector('input')!;

    text.set('два');
    await waitTime(0);

    expect(input.value).toBe('два');
  });

  it('чекбокс связывается по change', () => {
    const checked = createAtom(false);
    const App: FC = () => (
      <input id='input' type='checkbox' checked={checked} />
    );

    const input = setup(<App />).querySelector('input')!;

    input.click();

    expect(checked.get()).toBe(true);
  });

  it('свой обработчик не вытесняется', () => {
    const text = createAtom('раз');
    const input = vi.fn();
    const App: FC = () => <input id='input' value={text} input={input} />;

    const element = setup(<App />).querySelector('input')!;

    typeIn(element, 'два');

    expect(input).toHaveBeenCalledTimes(1);
    expect(text.get()).toBe('два');
  });

  it('связывается только управляемый проп', async () => {
    const title = createAtom('раз');
    const App: FC = () => <input id='input' title={title} />;

    const input = setup(<App />).querySelector('input')!;

    expect(input.getAttribute('title')).toBe('раз');

    // у title нет своего события — связывать нечего, атрибут остаётся атрибутом
    title.set('два');
    await waitTime(0);

    expect(input.getAttribute('title')).toBe('два');
  });

  it('в строке это обычный атрибут', () => {
    const text = createAtom('раз');
    const App: FC = () => <input value={text} />;

    expect(stringify(<App />)).toBe('<input value="раз">');
  });

  it('после гидратации связь живая', () => {
    const text = createAtom('раз');
    const App: FC = () => <input id='input' value={text} />;

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const input = root.querySelector('input')!;

    typeIn(input, 'два');

    expect(text.get()).toBe('два');
  });
});

describe('notBind', () => {
  it('отменяет обратную запись', () => {
    const text = createAtom('раз');
    const App: FC = () => <input id='input' value={notBind(text)} />;

    const input = setup(<App />).querySelector('input')!;

    typeIn(input, 'два');

    expect(text.get()).toBe('раз');
  });

  it('прямую связь оставляет', async () => {
    const text = createAtom('раз');
    const App: FC = () => <input id='input' value={notBind(text)} />;

    const input = setup(<App />).querySelector('input')!;

    text.set('два');
    await waitTime(0);

    expect(input.value).toBe('два');
  });

  it('нужен производному атому: в него писать нельзя', () => {
    const source = createAtom('раз');
    const upper = select((get) => get(source).toUpperCase());
    const App: FC = () => <input id='input' value={notBind(upper)} />;

    const input = setup(<App />).querySelector('input')!;

    typeIn(input, 'два');

    expect(upper.get()).toBe('РАЗ');
  });

  it('в строке разворачивается в значение', () => {
    const text = createAtom('раз');
    const App: FC = () => <input value={notBind(text)} />;

    expect(stringify(<App />)).toBe('<input value="раз">');
  });
});
