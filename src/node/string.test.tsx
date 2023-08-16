import {describe, expect, it, vi} from 'vitest';
import {getString} from './string/string.ts';
import {hydrate} from './node.ts';
import {waitTime} from 'utftu';

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
  // // @vitest-environment jsdom
  // it.only('hydrate()', async () => {
  //   const onClick = vi.fn();
  //   const Component3 = () => {
  //     return (
  //       <div id='div' click={onClick}>
  //         component3
  //       </div>
  //     );
  //   };
  //   const Component31 = () => {};
  //   const Component2 = () => {
  //     return (
  //       <div>
  //         <Component3 />
  //       </div>
  //     );
  //   };
  //   const Component1 = () => {
  //     return <Component2 />;
  //   };

  //   const app = document.createElement('div');
  //   document.body.appendChild(app);

  //   const str = await getString(<Component1 />);

  //   app.innerHTML = str;

  //   await hydrate(app, <Component2 />);
  //   document.getElementById('div')!.click();

  //   expect(onClick.mock.calls.length).toBe(1);
  //   document.getElementById('div')!.click();
  //   expect(onClick.mock.calls.length).toBe(2);
  // });
});
