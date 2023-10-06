import {describe, expect, it, vi} from 'vitest';
import {getString} from './string/string.ts';
import {Fragment} from '../components/fragment/fragment.ts';

describe('node', () => {
  it('getString()', async () => {
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
  it('fragment', async () => {
    const elem = (
      <Fragment>
        <div>hello</div>
        <Fragment>
          <div>world</div>
        </Fragment>
      </Fragment>
    );

    const str = await getString(elem);

    expect(str).toBe('<div>hello</div><div>world</div>');
  });
});
