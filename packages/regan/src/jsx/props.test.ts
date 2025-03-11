import {describe, expect, it} from 'vitest';
import {separateProps} from './props.ts';

describe('props', () => {
  it('separateProps', () => {
    const props = {
      a: 1,
      key: 2,
      r_b: 3,
    };

    const {userProps, systemProps} = separateProps(props);
    expect(userProps.a).toBe(1);
    expect(systemProps.key).toBe(2);
    expect((systemProps as any).b).toBe(3);
  });
});
