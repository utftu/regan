import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../../utils/tests.ts';
import {render} from '../../render/render.ts';
import {unmountHNodes} from '../../h-node/helpers.ts';
import {Show} from './show.tsx';
import {waitTime} from 'utftu';
import {createAtom} from 'strangelove';

describe('show', () => {
  it('simple', async () => {
    const onClick = vi.fn();
    const when = createAtom(true);
    const Component = () => {
      return (
        <div id='div' click={onClick}>
          component
          <Show when={when}>
            <div id='child'>child</div>
          </Show>
        </div>
      );
    };

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(document.getElementById('child')).not.toBe(null);

    when.set(false);

    await waitTime(0);

    expect(document.getElementById('child')).toBe(null);

    when.set(true);

    await waitTime(0);

    expect(document.getElementById('child')).not.toBe(null);
  });
  it('не копит производные атомы на when', () => {
    const when = createAtom(true);

    const App = () => {
      return (
        <Show when={when}>
          <div id='child'>child</div>
        </Show>
      );
    };

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      document.body.append(element);

      const {hNode} = render(element, <App />, {
        window: jsdom.window as any,
      });

      unmountHNodes(hNode);
      element.remove();
    }

    expect(when.relations.children.size).toBe(0);
  });
});
