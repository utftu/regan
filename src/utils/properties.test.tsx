import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';
import {insertAndHydrate} from './tests.ts';
import {unbind} from './bind.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);
  render(root, jsxNode, {window: jsdom.window as any as Window});

  return root;
};

describe('свойства элементов', () => {
  it('value управляет полем и после ввода пользователя', async () => {
    const value = createAtom('раз');
    const App: FC = () => <input id='input' value={value} />;

    const input = setup(<App />).querySelector('input')!;

    expect(input.value).toBe('раз');

    // пользователь напечатал — с этого момента атрибут полю больше не указ
    input.value = 'напечатал';

    value.set('два');
    await waitTime(0);

    expect(input.value).toBe('два');
    // атрибутом не дублируем: в html он значит другое
    expect(input.getAttribute('value')).toBe(null);
  });

  it('пропавший проп очищает свойство, а не снимает атрибут', async () => {
    const value = createAtom<any>('раз');
    const App: FC = () => <input id='input' value={value} />;

    const input = setup(<App />).querySelector('input')!;

    expect(input.value).toBe('раз');

    value.set(undefined);
    await waitTime(0);

    expect(input.value).toBe('');
  });

  it('в строке из stringify это по-прежнему атрибут', () => {
    const App: FC = () => <input value='раз' checked={true} />;

    expect(stringify(<App />)).toBe('<input value="раз" checked="">');
  });

  it('checked управляет чекбоксом после клика', async () => {
    const checked = createAtom(true);
    const App: FC = () => (
      <input id='input' type='checkbox' checked={checked} />
    );

    const input = setup(<App />).querySelector('input')!;

    expect(input.checked).toBe(true);

    input.click();
    expect(input.checked).toBe(false);

    checked.set(false);
    await waitTime(0);
    checked.set(true);
    await waitTime(0);

    expect(input.checked).toBe(true);
  });

  it('гидратация тоже берёт управление', async () => {
    const value = createAtom('раз');
    const App: FC = () => <input id='input' value={value} />;

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const input = root.querySelector('input')!;

    expect(input.value).toBe('раз');

    input.value = 'напечатал';
    value.set('два');
    await waitTime(0);

    expect(input.value).toBe('два');
  });

  it('чужому тегу свойство не пишем', () => {
    const App: FC = () => <div id='div' value='раз' />;

    const div = setup(<App />).querySelector('div')!;

    expect(div.getAttribute('value')).toBe('раз');
    expect('value' in div).toBe(false);
  });
});

describe('каретка', () => {
  it('не уезжает в конец, когда значение вернули из атома', async () => {
    const value = createAtom('123');
    const App: FC = () => (
      <input
        id='input'
        value={unbind(value)}
        input={({element}) => {
          // фильтр: буквы не принимаем, значение в атоме остаётся прежним
          if (/^\d*$/.test(element.value)) {
            value.set(element.value);
            return;
          }

          value.update();
        }}
      />
    );

    const input = setup(<App />).querySelector('input')!;
    const window = input.ownerDocument.defaultView as any;

    // печатаем 'a' после первой цифры
    input.value = '1a23';
    input.setSelectionRange(2, 2);
    input.dispatchEvent(new window.Event('input'));
    await waitTime(0);

    expect(input.value).toBe('123');
    expect(input.selectionStart).toBe(1);
  });

  it('поле без выделения не ломается', async () => {
    const value = createAtom('1');
    const App: FC = () => <input id='input' type='number' value={value} />;

    const input = setup(<App />).querySelector('input')!;

    expect(input.selectionStart).toBe(null);

    value.set('2');
    await waitTime(0);

    expect(input.value).toBe('2');
  });
});
