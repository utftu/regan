import {describe, expect, it} from 'vitest';
import {ContextEnt, createContext, getContextValue} from './context.tsx';
import {FC} from '../types.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {JSDOM} from 'jsdom';
import {Stage} from '../ctx/ctx.ts';
import {render} from '../render/render.ts';
import {getString} from '../string/string.ts';

const createComponents = () => {};

describe('context', () => {
  it('string', async () => {
    const context = createContext('test1', 'default');
    const values: string[] = [];

    const Elem3: FC = (_, {stage, ctx, getContext}) => {
      const value = getContext(context);
      values.push(value);
    };

    const Elem2: FC = (_, {stage, ctx, getContext}) => {
      const value = getContext(context);
      values.push(value);

      return (
        <context.Provider value='value2'>
          <Elem3 />
        </context.Provider>
      );
    };

    const Elem1: FC = (_, {parentContextEnt, getContext}) => {
      const value = getContextValue(context, parentContextEnt);
      values.push(value);

      return (
        <context.Provider value='value1'>
          <Elem2 />
        </context.Provider>
      );
    };

    await getString(<Elem1 />);

    expect(values[0]).toBe('default');
    expect(values[1]).toBe('value1');
    expect(values[2]).toBe('value2');
  });
  it('hydrate', async () => {
    const context = createContext('test1', 'default');
    const values: string[] = [];

    const Elem3: FC = (_, {stage, ctx, getContext}) => {
      const value = getContext(context);
      if (stage === 'hydrate') {
        values.push(value);
      }
    };

    const Elem2: FC = (_, {stage, ctx, getContext}) => {
      if (stage === 'hydrate') {
        const value = getContext(context);
        values.push(value);
      }

      return (
        <context.Provider value='value2'>
          <Elem3 />
        </context.Provider>
      );
    };

    const Elem1: FC = (_, {parentContextEnt, stage, getContext}) => {
      const value = getContextValue(context, parentContextEnt);
      if (stage === 'hydrate') {
        values.push(value);
      }

      return (
        <context.Provider value='value1'>
          <Elem2 />
        </context.Provider>
      );
    };

    const jsdom = new JSDOM();

    await insertAndHydrate({jsdom, jsxNode: <Elem1 />});

    expect(values[0]).toBe('default');
    expect(values[1]).toBe('value1');
    expect(values[2]).toBe('value2');
  });
  it('render', async () => {
    const jsdom = new JSDOM();
    const context = createContext('test1', 'default');
    const values: string[] = [];

    const Elem3: FC = (_, {stage, ctx, getContext}) => {
      const value = getContext(context);
      values.push(value);
    };

    const Elem2: FC = (_, {stage, ctx, getContext}) => {
      const value = getContext(context);
      values.push(value);

      return (
        <context.Provider value='value2'>
          <Elem3 />
        </context.Provider>
      );
    };

    const Elem1: FC = (_, {parentContextEnt, getContext}) => {
      const value = getContextValue(context, parentContextEnt);
      values.push(value);

      return (
        <context.Provider value='value1'>
          <Elem2 />
        </context.Provider>
      );
    };

    await render(jsdom.window.document.body, <Elem1 />, {
      window: jsdom.window as any as Window,
    });

    expect(values[0]).toBe('default');
    expect(values[1]).toBe('value1');
    expect(values[2]).toBe('value2');
  });
});
