import {describe, expect, it, vi} from 'vitest';
import {createAtomRegan} from '../../atoms/atoms.ts';
import {AtomWrapper} from './atom-wrapper.tsx';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../../utils/tests.ts';

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
  it.only('name change', async () => {
    const start = '<div id="name">My name is ';
    const end = '</div>';
    const atomName = createAtomRegan('Aleksey');

    const Component = () => <div id='name'>My name is {atomName}</div>;

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    await insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(document.getElementById('name')?.outerHTML).toBe(
      `${start}Aleksey${end}`
    );

    await atomName.set('Ivan');

    expect(document.getElementById('name')?.outerHTML).toBe(
      `${start}Ivan${end}`
    );
  });
});
