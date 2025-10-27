import {describe, expect, it} from 'vitest';
import {Fragment} from './fragment.ts';
import {stringify} from '../../stringify/stringify.ts';

describe('fragment/stringify', () => {
  it('simple', () => {
    const Component = () => {
      return (
        <Fragment>
          parent
          <div>div1</div>
          <div>
            div2
            <div>div2.1</div>
          </div>
          <div>div3</div>
        </Fragment>
      );
    };

    const Template = () => {
      return <Component />;
    };

    const str = stringify(<Template />);
    expect(str).toBe(
      'parent<div>div1</div><div>div2<div>div2.1</div></div><div>div3</div>'
    );
  });
});
