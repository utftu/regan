import {describe, expect, it, vi} from 'vitest';
import {createAtomRegan} from '../../atoms/atoms.ts';
import {AtomWrapper} from './atom-wrapper.tsx';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../../utils/tests.ts';

window.X;

describe('atom-wrapper', () => {
  it('simple', async () => {
    const onClick = vi.fn();
    const positiveAtomValue = <div id='child'>child</div>;
    const negativeAtomValue = null;
    const atom = createAtomRegan(positiveAtomValue);
    const Component = () => {
      return (
        <div id='div' click={onClick}>
          component
          <AtomWrapper atom={atom} />
          {/* <Show when={when}>
            <div id='child'>child</div>
          </Show> */}
        </div>
      );
    };

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    await insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(document.getElementById('child')).not.toBe(null);

    await atom.set(negativeAtomValue);

    expect(document.getElementById('child')).toBe(null);

    await atom.set(positiveAtomValue);

    expect(document.getElementById('child')).not.toBe(null);
  });
});
