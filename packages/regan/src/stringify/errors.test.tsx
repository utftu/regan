import {describe, expect, it} from 'vitest';
import {Fragment} from '../components/fragment/fragment.ts';
import {ErrorGuardJsx} from '../errors/errors.tsx';
import {stringify} from './stringify.ts';

const defaultAnswer = '<fragment></fragment>';

describe('string errors', () => {
  it('default error', () => {
    const Component = () => {
      throw new Error('my error');
    };

    const str = stringify(<Component />);
    expect(str).toBe(defaultAnswer);
  });

  it('error handler', () => {
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

    const str = stringify(<Parent />);
    expect(str).toBe('error');
  });
});
