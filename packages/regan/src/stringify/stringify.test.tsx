import {describe, expect, it} from 'vitest';
import {Fragment} from '../components/fragment/fragment.ts';
import {FC} from '../types.ts';
import {atom} from 'strangelove';
import {stringify} from './stringify.ts';
import {djb2, getHashFromString} from '../segment/jsx-path/jsx-path.ts';

describe('node', () => {
  it('strinfify()', () => {
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
    const str = stringify(<Parent a='b' />);

    expect(str).toBe(
      '<div hello="world" world="hello"><div>parent</div><div>child</div></div>'
    );
  });
  it('fragment', () => {
    const elem = (
      <Fragment>
        <div>hello</div>
        <Fragment>
          <div>world</div>
        </Fragment>
      </Fragment>
    );

    const str = stringify(elem);

    expect(str).toBe('<div>hello</div><div>world</div>');
  });
  it('child atoms', () => {
    const Child = () => {
      return <div>child</div>;
    };

    const Parent = () => {
      return (
        <div hello='world' world={atom('hello')}>
          <div>{atom('parent')}</div>
          {atom(<Child />)}
        </div>
      );
    };
    const str = stringify(<Parent a='b' />);

    expect(str).toBe(
      '<div hello="world" world="hello"><div>parent</div><div>child</div></div>'
    );
  });
  it('jsxPath', () => {
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

    stringify(<Level0 />);
    const jsxPath = '0.1.0.0.2?a=0.0.0.0';
    expect(level3JsxPath).toBe(jsxPath);
    expect(level3Id).toBe(djb2(jsxPath));
  });
  it('atom changed', () => {
    const atom1 = atom('hello');
    const atom2 = atom('world');

    const Child = () => {
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

    const str = stringify(<Parent />);
    setTimeout(() => {
      atom1.set('hello1');
    }, 20);
    // const str = await strPromise;

    expect(str).toBe(
      '<div hello="hello"><div>world</div><div hello="hello"><div>world</div></div></div>'
    );
  });
});
