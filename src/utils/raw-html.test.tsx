import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {stringify} from '../stringify/stringify.ts';
import {insertAndHydrate} from './tests.ts';
import {FC} from '../types.ts';

describe('rawHtml', () => {
  it('stringify подставляет разметку внутрь элемента', () => {
    const App: FC = () => {
      return <div id='holder' rawHtml='<span>снаружи</span>' />;
    };

    expect(stringify(<App />)).toBe(
      '<div id="holder"><span>снаружи</span></div>',
    );
  });

  it('rawHtml не попадает в атрибуты', () => {
    const App: FC = () => {
      return <div rawHtml='<b>x</b>' />;
    };

    expect(stringify(<App />)).not.toContain('rawHtml');
  });

  it('дети игнорируются, когда задан rawHtml', () => {
    const App: FC = () => {
      return (
        <div rawHtml='<b>сырое</b>'>
          <span>ребёнок</span>
        </div>
      );
    };

    expect(stringify(<App />)).toBe('<div><b>сырое</b></div>');
  });

  it('hydrate не заходит внутрь и не сбивает соседей', () => {
    const onClick = vi.fn();

    const App: FC = () => {
      return (
        <div id='root-app'>
          <div id='holder' rawHtml='<span id="inner">внутри</span>' />
          <button id='after' click={onClick}>
            кнопка
          </button>
        </div>
      );
    };

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});

    expect(root.querySelector('#inner')!.textContent).toBe('внутри');

    const button = root.querySelector('#after') as HTMLElement;
    button.dispatchEvent(new jsdom.window.Event('click'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
