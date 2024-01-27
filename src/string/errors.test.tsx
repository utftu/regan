import {describe, expect, it} from 'vitest';
import {getString} from './string.ts';
import {ErrorGuard} from '../errors/errors.tsx';

describe('string errors', () => {
  it('default error', async () => {
    const Component = () => {
      throw new Error('my error');
    };

    const str = await getString(<Component />);
    expect(str).toBe('');
  });

  it.only('error handler', async () => {
    const Child = () => {
      throw new Error('my error');
    };

    const Parent = () => {
      return (
        <ErrorGuard error={() => 'error'}>
          <Child />;
        </ErrorGuard>
      );
    };

    const str = await getString(<Parent />);
    expect(str).toBe('error');
  });
});
