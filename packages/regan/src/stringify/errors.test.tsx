import {describe, expect, it} from 'vitest';
import {Fragment} from '../components/fragment/fragment.ts';
import {stringify} from './stringify.ts';
import {ErrorGurard} from '../components/error-guard.tsx';

const defaultAnswer = '';

describe('string errors', () => {
  it('default error', () => {
    const Component = () => {
      throw new Error('my error');
    };

    expect(() => stringify(<Component />)).toThrowError('my error');
  });

  it('error handler', () => {
    const Child = () => {
      throw new Error('my error');
    };

    const Parent = () => {
      return (
        <ErrorGurard handler={() => 'error'}>
          <Fragment>
            <Child />
          </Fragment>
        </ErrorGurard>
      );
    };

    const str = stringify(<Parent />);
    expect(str).toBe('error');
  });
});
