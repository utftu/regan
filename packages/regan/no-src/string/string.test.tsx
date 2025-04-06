import {describe, expect, it} from 'vitest';
import {Fragment} from '../components/fragment/fragment.ts';
import {createAtomRegan} from '../atoms/atoms.ts';
import {FC} from '../types.ts';
import {atom} from 'strangelove';
import {getString} from './string.ts';
import {waitTime} from 'utftu';
import {getHashFromString} from '../segments/ent/jsx-path/jsx-path.ts';

const a = <div>sas</div>;

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
        <div hello='world' world={createAtomRegan('hello')}>
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
    let level3Id!: string;
    const Level3: FC = (_, ctx) => {
      level3JsxPath = ctx.getJsxPath();
      level3Id = ctx.getId();
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
          {/* 0.2(atom-wrapper)?a=0.0(fragment).0(component) */}
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
    const jsxPath = '0.1.0.0.2?a=0.0.0.0';
    expect(level3JsxPath).toBe(jsxPath);
    expect(level3Id).toBe(getHashFromString(jsxPath));
  });
  it('async', async () => {
    const Child = async () => {
      await waitTime(10);

      return 'hello world';
    };

    const Parent = () => {
      return <Child />;
    };
    const str = await getString(<Parent keyP='parent' />);

    expect(str).toBe('hello world');
  });
  it('atom changed', async () => {
    const atom1 = createAtomRegan('hello');
    const atom2 = createAtomRegan('world');

    const Child = async () => {
      await waitTime(100);

      return (
        <div hello={atom1}>
          <div>{atom2}</div>
        </div>
      );
    };

    const Parent = () => {
      return (
        <div hello={atom1}>
          <div>{atom2}</div>
          <Child />
        </div>
      );
    };

    const strPromise = getString(<Parent />);
    setTimeout(() => {
      atom1.set('hello1');
    }, 20);
    const str = await strPromise;

    expect(str).toBe(
      '<div hello="hello"><div>world</div><div hello="hello"><div>world</div></div></div>'
    );
  });
});
