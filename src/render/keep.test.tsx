import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from './render.ts';
import {ErrorGuard} from '../components/error-guard.tsx';
import {insertAndHydrate} from '../utils/tests.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);

  render(root, jsxNode, {window: jsdom.window as any});

  return root;
};

const ids = (holder: Element) =>
  Array.from(holder.children).map((child) => child.id);

describe('компонент с неизменившимся ключом не перезапускается', () => {
  it('состояние внутри компонента переживает перестановку', async () => {
    const Counter: FC<{name: string}> = ({name}) => {
      const count = createAtom(0);

      return (
        <button id={name} click={() => count.set(count.get() + 1)}>
          {count}
        </button>
      );
    };

    const list = createAtom<any>([
      <Counter key='a' name='a' />,
      <Counter key='b' name='b' />,
    ]);

    const holder = setup(<div id='holder'>{list}</div>).querySelector(
      '#holder'
    )!;

    const buttonA = holder.querySelector('#a') as HTMLElement;
    buttonA.click();
    buttonA.click();
    await waitTime(0);

    expect(buttonA.textContent).toBe('2');

    list.set([<Counter key='b' name='b' />, <Counter key='a' name='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['b', 'a']);
    expect(holder.querySelector('#a')).toBe(buttonA);
    expect(buttonA.textContent).toBe('2');
  });

  it('mount зовётся один раз, unmount — только для удалённого', async () => {
    const mounted: string[] = [];
    const unmounted: string[] = [];

    const Row: FC<{name: string}> = ({name}, ctx) => {
      ctx.mount(() => mounted.push(name));
      ctx.unmount(() => unmounted.push(name));

      return <span id={name}>{name}</span>;
    };

    const list = createAtom<any>([
      <Row key='a' name='a' />,
      <Row key='b' name='b' />,
    ]);

    const holder = setup(<div id='holder'>{list}</div>).querySelector(
      '#holder'
    )!;

    expect(mounted).toEqual(['a', 'b']);

    list.set([<Row key='b' name='b' />, <Row key='a' name='a' />]);
    await waitTime(0);

    list.set([<Row key='a' name='a' />, <Row key='b' name='b' />]);
    await waitTime(0);

    expect(mounted).toEqual(['a', 'b']);
    expect(unmounted).toEqual([]);

    list.set([<Row key='a' name='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['a']);
    expect(mounted).toEqual(['a', 'b']);
    expect(unmounted).toEqual(['b']);
  });

  it('атом внутри сохранённого компонента продолжает обновлять dom', async () => {
    const text = createAtom('раз');

    const Row: FC<{name: string}> = ({name}) => (
      <span id={name}>{name === 'a' ? text : name}</span>
    );

    const list = createAtom<any>([
      <Row key='a' name='a' />,
      <Row key='b' name='b' />,
    ]);

    const holder = setup(<div id='holder'>{list}</div>).querySelector(
      '#holder'
    )!;

    list.set([<Row key='b' name='b' />, <Row key='a' name='a' />]);
    await waitTime(0);

    text.set('два');
    await waitTime(0);

    expect(ids(holder)).toEqual(['b', 'a']);
    expect(holder.querySelector('#a')!.textContent).toBe('два');
  });

  it('тот же ключ, но другой компонент — рендерится заново', async () => {
    const mounted: string[] = [];

    const First: FC = (_props, ctx) => {
      ctx.mount(() => mounted.push('first'));
      return <span id='x'>first</span>;
    };
    const Second: FC = (_props, ctx) => {
      ctx.mount(() => mounted.push('second'));
      return <span id='x'>second</span>;
    };

    const value = createAtom<any>(<First key='a' />);

    const holder = setup(<div id='holder'>{value}</div>).querySelector(
      '#holder'
    )!;

    expect(holder.textContent).toBe('first');

    value.set(<Second key='a' />);
    await waitTime(0);

    expect(holder.textContent).toBe('second');
    expect(mounted).toEqual(['first', 'second']);
  });

  it('пропы сохранённого компонента заморожены на первом рендере', async () => {
    const Row: FC<{name: string}> = ({name}) => <span id='row'>{name}</span>;

    const value = createAtom<any>(<Row key='a' name='первый' />);

    const holder = setup(<div id='holder'>{value}</div>).querySelector(
      '#holder'
    )!;

    expect(holder.textContent).toBe('первый');

    // тот же ключ — компонент не перезапускается, новый name до него не доедет
    value.set(<Row key='a' name='второй' />);
    await waitTime(0);

    expect(holder.textContent).toBe('первый');

    // другой ключ — компонент создаётся заново и видит новые пропы
    value.set(<Row key='b' name='второй' />);
    await waitTime(0);

    expect(holder.textContent).toBe('второй');
  });

  it('ErrorGuard ловит падение компонента с ключом', () => {
    const Boom: FC = () => {
      throw new Error('бум');
    };

    const holder = setup(
      <div id='holder'>
        <ErrorGuard handler={() => <span id='caught'>поймали</span>}>
          <Boom key='a' />
        </ErrorGuard>
      </div>
    ).querySelector('#holder')!;

    expect(holder.textContent).toBe('поймали');
  });

  it('обработчик, объявленный снаружи, переживает обновление', async () => {
    const calls: string[] = [];
    const onClick = () => calls.push('клик');

    const value = createAtom<any>(
      <button id='b' click={onClick}>
        раз
      </button>
    );

    const holder = setup(<div id='holder'>{value}</div>).querySelector(
      '#holder'
    )!;
    const button = holder.querySelector('#b') as HTMLElement;

    button.click();
    expect(calls).toEqual(['клик']);

    // та же функция, но элемент пересобирается — слушатель должен уцелеть
    value.set(
      <button id='b' click={onClick}>
        два
      </button>
    );
    await waitTime(0);

    expect(holder.querySelector('#b')).toBe(button);
    expect(button.textContent).toBe('два');

    button.click();
    expect(calls).toEqual(['клик', 'клик']);
  });

  it('после гидратации ключи тоже сохраняют компонент', async () => {
    const mounted: string[] = [];

    const Row: FC<{name: string}> = ({name}, ctx) => {
      ctx.mount(() => mounted.push(name));

      return <span id={name}>{name}</span>;
    };

    const list = createAtom<any>([
      <Row key='a' name='a' />,
      <Row key='b' name='b' />,
    ]);

    const jsdom = new JSDOM();
    const root = insertAndHydrate({
      jsdom,
      jsxNode: <div id='holder'>{list}</div>,
    });
    const holder = root.querySelector('#holder')!;

    expect(mounted).toEqual(['a', 'b']);
    const spanA = holder.querySelector('#a');

    list.set([<Row key='b' name='b' />, <Row key='a' name='a' />]);
    await waitTime(0);

    expect(ids(holder)).toEqual(['b', 'a']);
    expect(holder.querySelector('#a')).toBe(spanA);
    expect(mounted).toEqual(['a', 'b']);
  });

  it('путь сохранённого компонента отражает новое место', async () => {
    const paths: Record<string, () => string> = {};

    const Row: FC<{name: string}> = ({name}, ctx) => {
      paths[name] = ctx.getJsxPath;

      return <span id={name}>{name}</span>;
    };

    const list = createAtom<any>([
      <Row key='a' name='a' />,
      <Row key='b' name='b' />,
    ]);

    setup(<div id='holder'>{list}</div>);

    const pathA = paths.a();
    const pathB = paths.b();

    expect(pathA).not.toBe(pathB);

    list.set([<Row key='b' name='b' />, <Row key='a' name='a' />]);
    await waitTime(0);

    // компоненты не перезапускались, но местами поменялись —
    // и путь у каждого теперь такой же, как у соседа до перестановки
    expect(paths.a()).not.toBe(pathA);
    expect(paths.a().endsWith('.1')).toBe(true);
    expect(paths.b().endsWith('.0')).toBe(true);
    expect(paths.a()).not.toBe(paths.b());
  });
});
