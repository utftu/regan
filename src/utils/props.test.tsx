import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from '../render/render.ts';
import {insertAndHydrate} from './tests.ts';
import {FC} from '../types.ts';

describe('динамические пропы', () => {
  it('атом, изменённый во время рендера, доезжает до DOM', () => {
    const cls = createAtom('первый');

    const Setter: FC = () => {
      cls.set('второй');
      return <span>setter</span>;
    };

    const App: FC = () => {
      return (
        <div>
          <div id='target' class={cls} />
          <Setter />
        </div>
      );
    };

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <App />, {window: jsdom.window as any});

    expect(root.querySelector('#target')!.getAttribute('class')).toBe('второй');
  });

  it('атом, изменённый во время гидратации, доезжает до DOM', () => {
    const cls = createAtom('первый');

    const Setter: FC = () => {
      cls.set('второй');
      return <span>setter</span>;
    };

    const App: FC = () => {
      return (
        <div>
          <div id='target' class={cls} />
          <Setter />
        </div>
      );
    };

    const jsdom = new JSDOM();
    const root = insertAndHydrate({jsdom, jsxNode: <App />});

    expect(root.querySelector('#target')!.getAttribute('class')).toBe('второй');
  });

  it('обновление после монтирования работает', async () => {
    const cls = createAtom('первый');

    const App: FC = () => <div id='target' class={cls} />;

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    render(root, <App />, {window: jsdom.window as any});

    cls.set('третий');
    await waitTime(0);

    expect(root.querySelector('#target')!.getAttribute('class')).toBe('третий');
  });

  it('после размонтирования подписки нет', async () => {
    const cls = createAtom('первый');

    const App: FC = () => <div id='target' class={cls} />;

    const jsdom = new JSDOM();
    const root = jsdom.window.document.createElement('div');
    jsdom.window.document.body.append(root);

    const {hNode} = render(root, <App />, {window: jsdom.window as any});
    const element = root.querySelector('#target')!;

    hNode.children.forEach((child) => child.unmount());

    cls.set('четвёртый');
    await waitTime(0);

    expect(element.getAttribute('class')).toBe('первый');
  });
});
