import {describe, expect, it} from 'vitest';
import {getString} from './string.ts';
import {ErrorGuard} from '../errors/errors.tsx';
import {Fragment} from '../components/fragment/fragment.ts';

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

    const Parent = () => {
      return (
        <ErrorGuard errorJsx={() => 'error'}>
          <Fragment>
            <Child />
          </Fragment>
        </ErrorGuard>
      );
    };

    const str = await getString(<Parent />);
    expect(str).toBe('error');
  });
});
