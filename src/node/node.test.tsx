import {describe, expect, it} from 'vitest';
import {toString} from './node.ts';

describe('node', () => {
  it('toString()', async () => {
    const Component = () => {
      return (
        <div c='d' v='h'>
          hello f
        </div>
      );
    };
    const str = await toString(<Component a='b' />);
    console.log('str', str);
    // console.log(str);
  });
});
