import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../../utils/tests.ts';
import {atom} from 'strangelove';
import {Show} from './show.tsx';
import {waitTime} from 'utftu';

describe('show', () => {
  it('simple', async () => {
    const onClick = vi.fn();
    const when = atom(true);
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
});
