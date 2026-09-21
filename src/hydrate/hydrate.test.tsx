import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {Fragment} from '../components/fragment/fragment.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {hydrate, stringify} from '../regan.ts';

describe('hydrate: структура дерева', () => {
  describe('child', () => {
    it('child element', () => {
      const onClick = vi.fn();
      const Component = () => {
        return (
          <div id='div' click={onClick}>
            component
          </div>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Component />});

      const div = jsdom.window.document.getElementById('div')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('child component', () => {
      debugger;
      const onClick = vi.fn();
      const Child = () => {
        return (
          <div id='child' click={onClick}>
            child
          </div>
        );
      };
      const Parent = () => {
        return (
          <div id='wrapper'>
            <div id='parent'>123</div>
            <Child id='child-component' />
          </div>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Parent />});

      const div = jsdom.window.document.getElementById('child')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('child component with fragment', () => {
      const onClick = vi.fn();
      const Child = () => {
        return (
          <Fragment>
            <div id='div' click={onClick}>
              child
            </div>
          </Fragment>
        );
      };
      const Parent = () => {
        return <Child />;
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Parent />});

      const div = jsdom.window.document.getElementById('div')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
  });

  describe('fragment', () => {
    it('fragment signle', () => {
      const onClick = vi.fn();
      const Component = () => {
        return (
          <Fragment id='fragment global'>
            <div id='div1'>div1</div>
            <Fragment id='fragment over two'>
              <div id='div2' click={onClick}>
                div2
              </div>
            </Fragment>
            <div id='div3'>div3</div>
          </Fragment>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Component />});

      const div = jsdom.window.document.getElementById('div2')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('fragment many', () => {
      const onClickDiv3 = vi.fn();
      const onClickDiv4 = vi.fn();
      const Component = () => {
        return (
          <Fragment>
            <div id='div1'>div1</div>
            <Fragment id='fragment over two'>
              <div id='div2'>div2</div>
              <div id='div3' click={onClickDiv3}>
                div3
              </div>
            </Fragment>
            <div id='div4' click={onClickDiv4}>
              div4
            </div>
          </Fragment>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Component />});

      const div3 = jsdom.window.document.getElementById('div3')!;
      const div4 = jsdom.window.document.getElementById('div4')!;

      div3.click();
      expect(onClickDiv3.mock.calls.length).toBe(1);
      div3.click();
      expect(onClickDiv3.mock.calls.length).toBe(2);

      div4.click();
      expect(onClickDiv4.mock.calls.length).toBe(1);
    });
  });

  it('nodeCount', () => {
    const childClick = vi.fn();
    const Component = () => {
      return (
        <div>
          <div>child1</div>
          child2 child3
          <div id='child4' click={childClick}>
            child4
          </div>
        </div>
      );
    };

    const jsdom = new JSDOM();
    insertAndHydrate({jsdom, jsxNode: <Component />});
    const child4 = jsdom.window.document.getElementById('child4')!;
    child4.click();
    expect(childClick.mock.calls.length).toBe(1);
  });

  it('html', () => {
    const clickFn = vi.fn();
    const Component = () => {
      return (
        <Fragment>
          {'<!DOCTYPE html>'}
          <html>
            <head>
              <title>1</title>
              <title>2</title>
            </head>
            <body>
              <div>3</div>
              <div click={clickFn} id='4'>
                4
              </div>
            </body>
          </html>
        </Fragment>
      );
    };

    const str = stringify(<Component />);
    const jsdom = new JSDOM(str);

    hydrate(jsdom.window.document, <Component />, {
      window: jsdom.window as any,
    });

    const elem = jsdom.window.document.getElementById('4')!;
    elem.click();
    elem.click();

    expect(clickFn.mock.calls.length).toBe(2);
  });
});
