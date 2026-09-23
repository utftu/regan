import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {render} from '../render/render.ts';
import {FC} from '../types.ts';

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);
  render(root, jsxNode, {window: jsdom.window as any as Window});

  return root;
};

describe('слушатели', () => {
  it('получают один объект с event и element', () => {
    const click = vi.fn();
    const App: FC = () => <button id='button' click={click} />;

    const button = setup(<App />).querySelector('button')!;
    button.click();

    expect(click).toHaveBeenCalledTimes(1);

    const props = click.mock.calls[0][0] as {event: Event; element: Element};

    expect(click.mock.calls[0]).toHaveLength(1);
    expect(props.element).toBe(button);
    expect(props.event.type).toBe('click');
  });

  it('element — тот, на котором висит обработчик, а не тот, по которому попали', () => {
    const click = vi.fn();
    const App: FC = () => (
      <div id='outer' click={click}>
        <span id='inner'>внутри</span>
      </div>
    );

    const root = setup(<App />);
    const outer = root.querySelector('#outer')!;
    const inner = root.querySelector('#inner') as HTMLElement;

    inner.click();

    const props = click.mock.calls[0][0] as {event: Event; element: Element};

    expect(props.element).toBe(outer);
    expect(props.event.target).toBe(inner);
  });
});
