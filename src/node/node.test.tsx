import {describe, expect, it} from 'vitest';
import {getString} from './node.ts';

describe('node', () => {
  it('toString()', async () => {
    const Child = () => {
      return <div>child</div>;
    };

    const Parent = () => {
      return (
        <div hello='world' world='hello'>
          <div>parent</div>
          <Child />
        </div>
      );
    };
    const str = await getString(<Parent a='b' />);
    expect(str).toBe(
      '<div hello="world" world="hello"><div>parent</div><div>child</div></div>'
    );
  });
});
