import {describe, expect, it, vi} from 'vitest';
import {getString} from '../string/string.ts';

describe('jsx', () => {
  it('string', async () => {
    const handler = vi.fn();
    const elements = [<div click={handler}>{0}</div>];
    const Child = () => {
      return <>{elements}</>;
    };

    const Parent = () => {
      return (
        <div>
          {elements}
          {/* <Child /> */}
        </div>
      );
    };
    const str = await getString(<Parent />);
    expect(str).toBe('<div><div>0</div></div>');
  });
});
