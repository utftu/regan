import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';
import {insertAndHydrate} from './tests.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);

  render(root, jsxNode, {window: jsdom.window as any});

  return root;
};

describe('булевы атрибуты', () => {
  it('ложное значение не ставит атрибут', () => {
    const App: FC = () => (
      <input id='i' hidden={false} disabled={false} required={false} />
    );

    const input = setup(<App />).querySelector('#i')!;

    expect(input.hasAttribute('hidden')).toBe(false);
    expect(input.hasAttribute('disabled')).toBe(false);
    expect(input.hasAttribute('required')).toBe(false);
  });

  it('истинное значение ставит пустой атрибут', () => {
    const App: FC = () => <input id='i' hidden={true} disabled={true} />;

    const input = setup(<App />).querySelector('#i')!;

    expect(input.getAttribute('hidden')).toBe('');
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it('в SSR так же', () => {
    const App: FC = () => <input hidden={false} disabled={true} />;

    expect(stringify(<App />)).toBe('<input disabled="">');
  });

  it('гидратация ставит атрибуты так же', () => {
    const App: FC = () => <input id='i' hidden={false} disabled={true} />;

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});
    const input = root.querySelector('#i')!;

    expect(input.hasAttribute('hidden')).toBe(false);
    expect(input.getAttribute('disabled')).toBe('');
  });

  it('атом переключает атрибут туда и обратно', async () => {
    const disabled = createAtom(false);

    const App: FC = () => <input id='i' disabled={disabled} />;

    const input = setup(<App />).querySelector('#i')!;

    expect(input.hasAttribute('disabled')).toBe(false);

    disabled.set(true);
    await waitTime(0);
    expect(input.getAttribute('disabled')).toBe('');

    disabled.set(false);
    await waitTime(0);
    expect(input.hasAttribute('disabled')).toBe(false);
  });

  it('строка "false" — это строка, а не булев проп', () => {
    const App: FC = () => <div id='d' aria-hidden='false' data-flag={false} />;

    const div = setup(<App />).querySelector('#d')!;

    // строкой передали — строкой и встало
    expect(div.getAttribute('aria-hidden')).toBe('false');
    // булевым передали — атрибута нет
    expect(div.hasAttribute('data-flag')).toBe(false);
  });

  it('числа становятся строкой, ноль тоже', () => {
    const App: FC = () => <div id='d' tabIndex={0} data-count={42} />;

    const div = setup(<App />).querySelector('#d')!;

    expect(div.getAttribute('tabIndex')).toBe('0');
    expect(div.getAttribute('data-count')).toBe('42');
  });

  it('undefined не ставит атрибут и не пишет "undefined"', () => {
    const App: FC = () => <div id='d' title={undefined} />;

    const div = setup(<App />).querySelector('#d')!;

    expect(div.hasAttribute('title')).toBe(false);
  });
});

describe('style объектом', () => {
  it('горбатые имена становятся дефисными', () => {
    const App: FC = () => (
      <div id='d' style={{backgroundColor: 'red', fontSize: 12}} />
    );

    expect(
      setup(<App />)
        .querySelector('#d')!
        .getAttribute('style'),
    ).toBe('background-color: red; font-size: 12');
  });

  it('свои свойства не переименовываются', () => {
    const App: FC = () => <div id='d' style={{'--gap': '4px'}} />;

    expect(
      setup(<App />)
        .querySelector('#d')!
        .getAttribute('style'),
    ).toBe('--gap: 4px');
  });

  it('строкой тоже можно', () => {
    const App: FC = () => <div id='d' style='color: red' />;

    expect(
      setup(<App />)
        .querySelector('#d')!
        .getAttribute('style'),
    ).toBe('color: red');
  });

  it('в SSR так же', () => {
    const App: FC = () => <div style={{marginTop: '4px'}} />;

    expect(stringify(<App />)).toBe('<div style="margin-top: 4px"></div>');
  });

  it('атом со style-объектом обновляется', async () => {
    const style = createAtom<any>({color: 'red'});

    const App: FC = () => <div id='d' style={style} />;

    const div = setup(<App />).querySelector('#d')!;
    expect(div.getAttribute('style')).toBe('color: red');

    style.set({color: 'blue', fontWeight: 'bold'});
    await waitTime(0);

    expect(div.getAttribute('style')).toBe('color: blue; font-weight: bold');
  });
});

describe('svg', () => {
  const svgNamespace = 'http://www.w3.org/2000/svg';

  it('svg и его дети создаются в своём пространстве имён', () => {
    const App: FC = () => (
      <svg id='s' viewBox='0 0 10 10'>
        <g id='g'>
          <circle id='c' r='5' />
        </g>
      </svg>
    );

    const root = setup(<App />);

    expect(root.querySelector('#s')!.namespaceURI).toBe(svgNamespace);
    expect(root.querySelector('#g')!.namespaceURI).toBe(svgNamespace);
    expect(root.querySelector('#c')!.namespaceURI).toBe(svgNamespace);
  });

  it('соседний html рядом со svg остаётся html', () => {
    const App: FC = () => (
      <div id='wrap'>
        <svg id='s' />
        <span id='sp' />
      </div>
    );

    const root = setup(<App />);

    expect(root.querySelector('#s')!.namespaceURI).toBe(svgNamespace);
    expect(root.querySelector('#sp')!.namespaceURI).toBe(
      'http://www.w3.org/1999/xhtml',
    );
  });

  it('svg, пришедший из динамической области', async () => {
    const value = createAtom<any>(null);

    const App: FC = () => <div id='holder'>{value}</div>;

    const holder = setup(<App />).querySelector('#holder')!;

    value.set(<svg id='s' />);
    await waitTime(0);

    expect(holder.querySelector('#s')!.namespaceURI).toBe(svgNamespace);
  });
});
