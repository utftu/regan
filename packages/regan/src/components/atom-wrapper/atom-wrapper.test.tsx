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

    // expect(document.getElementById('child')).toBe(null);

    // await atom.set(positiveAtomValue);

    // expect(document.getElementById('child')).not.toBe(null);
  });
  // it('1', async () => {
  //   const Component: FC = (_, {createAtom}) => {
  //     const atom = createAtom('hello');
  //     return <div id='div'>value is {atom}</div>;
  //   };

  //   const jsdom = new JSDOM();
  //   const document = jsdom.window.document;

  //   await insertAndHydrate({jsdom, jsxNode: <Component />});

  //   // console.log(
  //   //   '-----',
  //   //   'document.getElementById(',
  //   //   document.getElementById('div')?.childNodes.length
  //   // );

  //   // expect(document.getElementById('div')?.children[1].innerHTML).toBe('hello');
  // });
  // it('2', async () => {
  //   const Component: FC = (_, {createAtom}) => {
  //     const atom = createAtom('hello');
  //     return <div id='div'>value is {atom}</div>;
  //   };

  //   const jsdom = new JSDOM();
  //   const document = jsdom.window.document;

  //   await render(document.body, <Component />, {window: jsdom.window});

  //   console.log(
  //     '-----',
  //     'document.getElementById(',
  //     document.getElementById('div')?.childNodes.length
  //   );

  //   // expect(document.getElementById('div')?.children[1].innerHTML).toBe('hello');
  // });
});
