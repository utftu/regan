import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {render} from '../render/render.ts';
import {unmountHNodes} from '../h-node/helpers.ts';
import {insertAndHydrate} from './tests.ts';
import {FC} from '../types.ts';

describe('ref', () => {
  it('render: функция получает элемент', () => {
    const elements: (Element | undefined)[] = [];

    const App: FC = () => {
      return <div id='target' ref={(element) => elements.push(element)} />;
    };

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <App />, {window: jsdom.window as any});

    expect(elements.length).toBe(1);
    expect((elements[0] as Element).getAttribute('id')).toBe('target');
  });

  it('render: атом получает элемент', () => {
    const ref = createAtom<Element | undefined>(undefined);

    const App: FC = () => {
      return <div id='target' ref={ref} />;
    };

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <App />, {window: jsdom.window as any});

    expect(ref.get()?.getAttribute('id')).toBe('target');
  });

  it('ref не попадает в атрибуты', () => {
    const ref = createAtom<Element | undefined>(undefined);

    const App: FC = () => {
      return <div id='target' ref={ref} />;
    };

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <App />, {window: jsdom.window as any});

    expect(root.innerHTML).toBe('<div id="target"></div>');
  });

  it('на unmount ref очищается', () => {
    const ref = createAtom<Element | undefined>(undefined);

    const App: FC = () => {
      return <div id='target' ref={ref} />;
    };

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    const {hNode} = render(root, <App />, {window: jsdom.window as any});

    expect(ref.get()).not.toBe(undefined);

    unmountHNodes(hNode);

    expect(ref.get()).toBe(undefined);
  });

  it('hydrate: ref получает существующий элемент', () => {
    const ref = createAtom<Element | undefined>(undefined);

    const App: FC = () => {
      return <div id='target' ref={ref} />;
    };

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});

    expect(ref.get()).toBe(root.querySelector('#target')!);
  });
});
