import {describe, expect, it} from 'vitest';
import {createContext, getContextValue} from './context.tsx';
import {FC} from '../types.ts';
import {insertAndHydrate} from '../utils/tests.ts';
import {JSDOM} from 'jsdom';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';

describe('context', () => {
  it('string', () => {
    const context = createContext('test1', 'default');
    const values: string[] = [];

    const Elem3: FC = (_, {getContext}) => {
      const value = getContext(context);
      values.push(value);
    };

    const Elem2: FC = (_, {getContext}) => {
      const value = getContext(context);
      values.push(value);

      return (
        <context.Provider value='value2'>
          <Elem3 />
        </context.Provider>
      );
    };

    const Elem1: FC = (_, {segmentEnt}) => {
      const value = getContextValue(context, segmentEnt.contextEnt);
      values.push(value);

      return (
        <context.Provider value='value1'>
          <Elem2 />
        </context.Provider>
      );
    };

    stringify(<Elem1 />);

    expect(values[0]).toBe('default');
    expect(values[1]).toBe('value1');
    expect(values[2]).toBe('value2');
  });
  it('hydrate', () => {
    const context = createContext('test1', 'default');
    const values: string[] = [];

    const Elem3: FC = (_, {stage, getContext}) => {
      const value = getContext(context);
      if (stage === 'hydrate') {
        values.push(value);
      }
    };

    const Elem2: FC = (_, {stage, getContext}) => {
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

    const Elem1: FC = (_, {segmentEnt, stage, getContext}) => {
      const value = getContextValue(context, segmentEnt.contextEnt);
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

    insertAndHydrate({jsdom, jsxNode: <Elem1 />});

    expect(values[0]).toBe('default');
    expect(values[1]).toBe('value1');
    expect(values[2]).toBe('value2');
  });
  it('render', () => {
    const jsdom = new JSDOM();
    const context = createContext('test1', 'default');
    const values: string[] = [];

    const Elem3: FC = (_, {getContext}) => {
      const value = getContext(context);
      values.push(value);
    };

    const Elem2: FC = (_, {getContext}) => {
      const value = getContext(context);
      values.push(value);

      return (
        <context.Provider value='value2'>
          <Elem3 />
        </context.Provider>
      );
    };

    const Elem1: FC = (_, {segmentEnt}) => {
      const value = getContextValue(context, segmentEnt.contextEnt);
      values.push(value);

      return (
        <context.Provider value='value1'>
          <Elem2 />
        </context.Provider>
      );
    };

    render(jsdom.window.document.body, <Elem1 />, {
      window: jsdom.window as any as Window,
    });

    expect(values[0]).toBe('default');
    expect(values[1]).toBe('value1');
    expect(values[2]).toBe('value2');
  });
});
