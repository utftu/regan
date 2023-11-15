import {describe, expect, it} from 'vitest';
import {Fragment} from '../components/fragment/fragment.ts';
import {createAtomRegan} from '../atoms/atoms.ts';
import {FC} from '../types.ts';
import {atom} from 'strangelove';
import {getString} from './string.ts';

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
  it('child atoms', async () => {
    const Child = () => {
      return <div>child</div>;
    };

    const Parent = () => {
      return (
        <div hello='world' world='hello'>
          <div>{createAtomRegan('parent')}</div>
          {createAtomRegan(<Child />)}
        </div>
      );
    };
    const str = await getString(<Parent a='b' />);

    expect(str).toBe(
      '<div hello="world" world="hello"><div>parent</div><div>child</div></div>'
    );
  });
  it('jsxPath', async () => {
    let level3JsxPath!: string;
    const Level3: FC = (_, ctx) => {
      level3JsxPath = ctx.jsxPath;
      return <div>level3</div>;
    };
    const Level2 = () => {
      // 0
      return <Level3 />;
    };
    const level1Atom = atom(<Level2 />);
    const Level1 = () => {
      return (
        <div>
          level1
          <div>empty</div>
          <div>empty</div>
          {/* 0.2:a=0 */}
          {level1Atom}
        </div>
      );
    };
    const Level0 = () => {
      return (
        <div>
          <div>parent</div>
          {/* 0.1.0 */}
          <Fragment>
            <Level1 />
          </Fragment>
        </div>
      );
    };

    await getString(<Level0 />);
    expect(level3JsxPath).toBe('0.1.0.0.2:a=0.0');
  });
});
