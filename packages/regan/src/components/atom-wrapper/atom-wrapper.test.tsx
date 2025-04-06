import {describe, expect, it, vi} from 'vitest';

import {AtomWrapper} from './atom-wrapper.tsx';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../../utils/tests.ts';
import {atom} from 'strangelove';
import {waitTime} from 'utftu';

describe('atom-wrapper', () => {
  it('simple', async () => {
    const onClick = vi.fn();
    const positiveAtomValue = <div id='child'>child</div>;
    const negativeAtomValue = null;
    const createdAtom = atom<any>(positiveAtomValue);
    const Component = () => {
      return (
        <div id='div' click={onClick}>
          component
          {createdAtom}
        </div>
      );
    };

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(document.getElementById('child')).not.toBe(null);

    createdAtom.set(negativeAtomValue);

    await waitTime(0);

    expect(document.getElementById('child')).toBe(null);

    createdAtom.set(positiveAtomValue);

    await waitTime(0);

    expect(document.getElementById('child')).not.toBe(null);
  });
  it('name change', async () => {
    const start = '<div id="name">My name is ';
    const end = '</div>';
    const atomName = atom('Aleksey');

    const Component = () => <div id='name'>My name is {atomName}</div>;

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(document.getElementById('name')?.outerHTML).toBe(
      `${start}Aleksey${end}`
    );

    atomName.set('Ivan');

    await waitTime(0);

    expect(document.getElementById('name')?.outerHTML).toBe(
      `${start}Ivan${end}`
    );
  });
});
