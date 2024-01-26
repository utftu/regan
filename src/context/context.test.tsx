import {describe, expect, it} from 'vitest';
import {createContext, getContextValue} from './context.tsx';
import {FC} from '../types.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {JSDOM} from 'jsdom';
import {Stage} from '../ctx/ctx.ts';
import {render} from '../render/render.ts';

describe('context', () => {
  it('deep', async () => {
    const values: any = {
      string: [],
      hydrate: [],
      render: [],
    };

    const context = createContext('test1', 'default');
    const Elem3: FC = (_, {stage, ctx}) => {
      const value = getContextValue(context, ctx) as Stage;
      values[stage].push(value);
    };

    const Elem2: FC = (_, {stage, ctx}) => {
      const value = getContextValue(context, ctx);
      values[stage].push(value);

      return (
        <context.Provider value='value2'>
          <Elem3 />
        </context.Provider>
      );
    };

    const Elem1: FC = (_, {ctx, stage}) => {
      const value = getContextValue(context, ctx);
      values[stage].push(value);

      return (
        <context.Provider value='value1'>
          <Elem2 />
        </context.Provider>
      );
    };

    const jsdom = new JSDOM();

    await insertAndHydrate({jsdom, jsxNode: <Elem1 />});

    // string
    expect(values.string[0]).toBe('default');
    expect(values.string[1]).toBe('value1');
    expect(values.string[2]).toBe('value2');

    // hydrate
    expect(values.hydrate[0]).toBe('default');
    expect(values.hydrate[1]).toBe('value1');
    expect(values.hydrate[2]).toBe('value2');

    await render(jsdom.window.document.body, <Elem1 />, {
      window: jsdom.window as any as Window,
    });

    // render
    expect(values.render[0]).toBe('default');
    expect(values.render[1]).toBe('value1');
    expect(values.render[2]).toBe('value2');
  });
});
