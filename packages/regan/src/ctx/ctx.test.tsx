import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {FC} from '../types.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {render} from '../render/render.ts';

describe('ctx', () => {
  it('mount callback', async () => {
    const mountFn = vi.fn();

    const Component: FC = (_, ctx) => {
      ctx.mount(() => {
        mountFn();
      });
      return <div>test</div>;
    };

    const jsdom = new JSDOM();

    insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(mountFn).toHaveBeenCalledTimes(1);
  });

  it('mount returns unmount', async () => {
    const unmountFn = vi.fn();

    const Component: FC = (_, ctx) => {
      ctx.mount(() => {
        return unmountFn;
      });
      return <div>test</div>;
    };

    const jsdom = new JSDOM();

    const {hNode} = insertAndHydrate({jsdom, jsxNode: <Component />}) as any;

    expect(unmountFn).not.toHaveBeenCalled();
  });

  it('unmount callback', async () => {
    const unmountFn = vi.fn();

    const Component: FC = (_, ctx) => {
      ctx.unmount(unmountFn);
      return <div>test</div>;
    };

    const jsdom = new JSDOM();

    insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(unmountFn).not.toHaveBeenCalled();
  });

  it('getJsxPath returns path', () => {
    let path = '';

    const Child: FC = (_, ctx) => {
      path = ctx.getJsxPath();
      return <div>child</div>;
    };

    const Parent: FC = () => {
      return (
        <div>
          <Child />
        </div>
      );
    };

    const jsdom = new JSDOM();

    render(jsdom.window.document.body, <Parent />, {
      window: jsdom.window as any as Window,
    });

    expect(path).toBe('0.0');
  });

  it('getId returns unique id', () => {
    const ids: string[] = [];

    const Child: FC = (_, ctx) => {
      ids.push(ctx.getId());
      return <div>child</div>;
    };

    const Parent: FC = () => {
      return (
        <div>
          <Child />
          <Child />
        </div>
      );
    };

    const jsdom = new JSDOM();

    render(jsdom.window.document.body, <Parent />, {
      window: jsdom.window as any as Window,
    });

    expect(ids.length).toBe(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('props accessible', () => {
    let receivedProps: any;

    const Component: FC<{name: string; count: number}> = (props, ctx) => {
      receivedProps = ctx.props;
      return <div>{props.name}</div>;
    };

    const jsdom = new JSDOM();

    render(jsdom.window.document.body, <Component name="test" count={42} />, {
      window: jsdom.window as any as Window,
    });

    expect(receivedProps.name).toBe('test');
    expect(receivedProps.count).toBe(42);
  });

  it('children accessible', () => {
    let childrenCount = 0;

    const Wrapper: FC = (_, ctx) => {
      childrenCount = ctx.children.length;
      return <div>{ctx.children}</div>;
    };

    const jsdom = new JSDOM();

    render(
      jsdom.window.document.body,
      <Wrapper>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </Wrapper>,
      {window: jsdom.window as any as Window}
    );

    expect(childrenCount).toBe(3);
  });

  it('stage is correct for render', () => {
    let stage = '';

    const Component: FC = (_, ctx) => {
      stage = ctx.stage;
      return <div>test</div>;
    };

    const jsdom = new JSDOM();

    render(jsdom.window.document.body, <Component />, {
      window: jsdom.window as any as Window,
    });

    expect(stage).toBe('render');
  });

  it('stage is correct for hydrate', () => {
    let stage = '';

    const Component: FC = (_, ctx) => {
      stage = ctx.stage;
      return <div>test</div>;
    };

    const jsdom = new JSDOM();

    insertAndHydrate({jsdom, jsxNode: <Component />});

    expect(stage).toBe('hydrate');
  });
});
