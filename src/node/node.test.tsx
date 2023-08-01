import {describe, expect, it} from 'vitest';

describe('node', () => {
  it('a', async () => {
    const Component = () => {
      return <div>hello</div>;
    };
    const str = await toString(<Component />);
    console.log(str);
  });
});
