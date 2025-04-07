import {describe, expect, it, vi} from 'vitest';
import {Fragment} from '../components/fragment/fragment.ts';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../utils/tests.ts';
import {FC} from '../types.ts';

describe('jsx', () => {
  it('string', () => {
    const handler = vi.fn();
    const elements = [
      <div id='0' click={handler}>
        {0}
      </div>,
    ];
    const Child = () => {
      return <Fragment>{elements}</Fragment>;
    };

    const Parent: FC = () => {
      return (
        <div>
          <div>not empty</div>
          <Child />
        </div>
      );
    };

    const jsdom = new JSDOM();

    const root = insertAndHydrate({jsdom, jsxNode: <Parent />});

    expect(root.innerHTML).toBe(
      '<div><div>not empty</div><div id="0">0</div></div>'
    );

    jsdom.window.document.getElementById('0')!.click();

    expect(handler.mock.calls.length).toBe(1);
  });
});
