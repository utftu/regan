import {describe, expect, it} from 'vitest';
import {getString} from './string.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {ErrorGuardJsx} from '../errors/errors.tsx';

const defaultAnswer = '<fragment></fragment>';

describe('string errors', () => {
  it('default error', async () => {
    const Component = () => {
      throw new Error('my error');
    };

    const str = await getString(<Component />);
    expect(str).toBe(defaultAnswer);
  });

  it('error handler', async () => {
    const Child = () => {
      throw new Error('my error');
    };

    const errorJsx = () => 'error';
    errorJsx.hello = 'world';

    const Parent = () => {
      return (
        <ErrorGuardJsx errorJsx={errorJsx}>
          <Fragment>
            <Child />
          </Fragment>
        </ErrorGuardJsx>
      );
    };

    const str = await getString(<Parent />);
    expect(str).toBe('error');
  });
});
