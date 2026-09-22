import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {waitTime} from 'utftu';
import {ErrorGuard} from '../components/error-guard.tsx';
import {hydrate, hydrateRaw} from '../hydrate/hydrate.ts';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';
import {ErrorRegan} from './errors.ts';
import {FC} from '../types.ts';

type Call = {handled: boolean; message: string};

const setup = (jsxNode: any) => {
  const calls: Call[] = [];
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.appendChild(root);
  try {
    root.innerHTML = stringify(jsxNode);
  } catch {
    // разметка нужна только чтобы гидратации было за что держаться; если и
    // на сервере всё падает, хватит и пустой. Своих обработчиков у stringify
    // нет — в calls от него ничего не попадёт
    root.innerHTML = '';
  }

  const hydrate = () =>
    hydrateRaw({
      node: jsxNode,
      window: jsdom.window as any as Window,
      domPointer: {parent: root, nodeCount: 0},
      errorHandlers: [
        ({error, handled}) => calls.push({handled, message: error.message}),
      ],
    });

  return {calls, jsdom, hydrate};
};

const Button: FC = () => (
  <button
    id='button'
    click={() => {
      throw new Error('бум');
    }}
  >
    x
  </button>
);

const Boom: FC = () => {
  throw new Error('бум');
};

describe('глобальные обработчики', () => {
  it('принимаются всеми тремя входами', () => {
    const calls: Call[] = [];
    const errorHandlers = [
      ({error, handled}: {error: ErrorRegan; handled: boolean}) =>
        calls.push({handled, message: error.message}),
    ];

    expect(() => stringify(<Boom />, {errorHandlers})).toThrow('бум');
    expect(calls).toHaveLength(1);

    const jsdom = new JSDOM();

    expect(() =>
      render(jsdom.window.document.body, <Boom />, {
        window: jsdom.window as any as Window,
        errorHandlers,
      }),
    ).toThrow('бум');
    expect(calls).toHaveLength(2);

    expect(() =>
      hydrate(jsdom.window.document.body, <Boom />, {
        window: jsdom.window as any as Window,
        errorHandlers,
      }),
    ).toThrow('бум');
    expect(calls).toHaveLength(3);

    expect(calls.every((call) => call.handled === false)).toBe(true);
  });

  it('ошибка в слушателе под guard — один вызов, перехвачена', async () => {
    const {calls, jsdom, hydrate} = setup(
      <ErrorGuard handler={() => <div>упс</div>}>
        <Button />
      </ErrorGuard>,
    );

    hydrate();
    jsdom.window.document.getElementById('button')!.click();
    await waitTime(0);

    expect(calls).toEqual([{handled: true, message: 'бум'}]);
  });

  it('ошибка в слушателе без guard — один вызов, не перехвачена', async () => {
    const original = globalThis.reportError;
    globalThis.reportError = () => {};

    try {
      const {calls, jsdom, hydrate} = setup(<Button />);

      hydrate();
      jsdom.window.document.getElementById('button')!.click();
      await waitTime(0);

      expect(calls).toEqual([{handled: false, message: 'бум'}]);
    } finally {
      globalThis.reportError = original;
    }
  });

  it('падение компонента под guard — один вызов, перехвачена', () => {
    const {calls, hydrate} = setup(
      <ErrorGuard handler={() => <div>упс</div>}>
        <Boom />
      </ErrorGuard>,
    );

    hydrate();

    expect(calls).toEqual([{handled: true, message: 'бум'}]);
  });

  it('обработчик, который бросает, перехватившим не считается', () => {
    const {calls, hydrate} = setup(
      <ErrorGuard
        handler={({error}) => {
          throw error;
        }}
      >
        <Boom />
      </ErrorGuard>,
    );

    expect(hydrate).toThrow('бум');

    // первый вызов — от guard, второй — от вылета ошибки из hydrate
    expect(calls[0]).toEqual({handled: false, message: 'бум'});
  });
});
