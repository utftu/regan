import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {Show} from './show.ts';
import {createAtomRegan} from '../../atoms/atoms.ts';
import {insertAndHydrate} from '../../utils/tests.ts';

describe('show', () => {
  it('simple', async () => {
    const onClick = vi.fn();
    const when = createAtomRegan(true);
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

    await insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(document.getElementById('child')).not.toBe(null);

    await when.set(false);

    expect(document.getElementById('child')).toBe(null);

    await when.set(true);

    expect(document.getElementById('child')).not.toBe(null);
  });
});
