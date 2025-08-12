import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../../utils/tests.ts';
import {waitTime} from 'utftu';
import {createAtom} from 'strangelove';

describe('atom-wrapper', () => {
  it('simple', async () => {
    const onClick = vi.fn();
    const positiveAtomValue = <div id='child'>child</div>;
    const negativeAtomValue = null;
    const createdAtom = createAtom<any>(positiveAtomValue);
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
    const atomName = createAtom('Aleksey');

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
  it('several dynamic zones', async () => {
    const atom1 = createAtom('1');
    const atom2 = createAtom('2');
    const atom3 = createAtom('3');
    const atom4 = createAtom('4');
    const atom5 = createAtom('5');

    const Component = () => (
      <div id='div'>
        {atom1} {atom2} {atom3} {atom4} {atom5}
      </div>
    );

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    insertAndHydrate({jsdom, jsxNode: <Component />});
    const div = document.getElementById('div')!;

    expect(div.outerHTML).toBe(`<div id="div">1 2 3 4 5</div>`);

    atom3.set('3.1');

    await waitTime(0);

    expect(div.outerHTML).toBe(`<div id="div">1 2 3.1 4 5</div>`);

    atom4.set('4.1');

    await waitTime(0);

    expect(div.outerHTML).toBe(`<div id="div">1 2 3.1 4.1 5</div>`);
  });
});
