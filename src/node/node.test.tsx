import {describe, expect, it} from 'vitest';
import {toString} from './node.ts';

describe('node', () => {
  it('a', async () => {
    const Component = () => {
      return <div>hello</div>;
    };
    const result = <Component a='b' />;
    // console.log(result);
    const str = await toString(result);
    // console.log(str);
  });
});
