import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {waitTime} from 'utftu';
import {render} from '../../render/render.ts';
import {FC} from '../../types.ts';
import {createField} from './field.ts';

const required = (value: string) => (value === '' ? 'Обязательно' : undefined);

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);
  render(root, jsxNode, {window: jsdom.window as any as Window});

  return root;
};

describe('Field', () => {
  it('начальное состояние', () => {
    const field = createField({value: 'Робин'});

    expect(field.value.get()).toBe('Робин');
    expect(field.error.get()).toBe('');
    expect(field.touched.get()).toBe(false);
  });

  it('validate пишет ошибку и отдаёт её', () => {
    const field = createField({value: '', validate: required});

    expect(field.validate()).toBe('Обязательно');
    expect(field.error.get()).toBe('Обязательно');

    field.set('Робин');

    expect(field.validate()).toBe('');
    expect(field.error.get()).toBe('');
  });

  it('поле без validate всегда чистое', () => {
    const field = createField({value: ''});

    expect(field.validate()).toBe('');
  });

  it('set значение не проверяет', () => {
    const field = createField({value: 'Робин', validate: required});

    field.set('');

    expect(field.error.get()).toBe('');
  });

  it('показанная ошибка пересчитывается на любое изменение значения', () => {
    const field = createField({value: '', validate: required});

    field.validate();
    expect(field.error.get()).toBe('Обязательно');

    field.set('Робин');
    expect(field.error.get()).toBe('');

    // ошибки нет — молчим и дальше
    field.set('');
    expect(field.error.get()).toBe('');
  });

  it('reset возвращает к тому, с чего начали', () => {
    const field = createField({value: 'Робин', validate: required});

    field.set('');
    field.validate();
    field.setTouched(true);
    field.reset();

    expect(field.value.get()).toBe('Робин');
    expect(field.error.get()).toBe('');
    expect(field.touched.get()).toBe(false);
  });

  it('начальные touched и error можно задать', () => {
    const field = createField({value: '', touched: true, error: 'с сервера'});

    expect(field.touched.get()).toBe(true);
    expect(field.error.get()).toBe('с сервера');
  });

  describe('getInput', () => {
    it('ввод кладёт значение в поле', async () => {
      const field = createField({value: 'Робин', validate: required});
      const App: FC = () => <input id='input' {...field.getInput()} />;

      const input = setup(<App />).querySelector('input')!;

      expect(input.value).toBe('Робин');

      input.value = 'Мэриан';
      input.dispatchEvent(
        new (input.ownerDocument.defaultView as any).Event('input'),
      );

      expect(field.value.get()).toBe('Мэриан');
    });

    it('blur делает поле тронутым и проверяет его', () => {
      const field = createField({value: '', validate: required});
      const App: FC = () => <input id='input' {...field.getInput()} />;

      const input = setup(<App />).querySelector('input')!;

      input.dispatchEvent(
        new (input.ownerDocument.defaultView as any).Event('blur'),
      );

      expect(field.touched.get()).toBe(true);
      expect(field.error.get()).toBe('Обязательно');
    });

    it('показанная ошибка уходит по ходу ввода', () => {
      const field = createField({value: '', validate: required});
      const App: FC = () => <input id='input' {...field.getInput()} />;

      const input = setup(<App />).querySelector('input')!;
      const window = input.ownerDocument.defaultView as any;

      field.validate();
      expect(field.error.get()).toBe('Обязательно');

      input.value = 'Робин';
      input.dispatchEvent(new window.Event('input'));

      expect(field.error.get()).toBe('');
    });

    it('атом значения виден разметке', async () => {
      const field = createField({value: 'Робин'});
      const App: FC = () => (
        <div>
          <input id='input' {...field.getInput()} />
          <span id='error'>{field.error}</span>
        </div>
      );

      const root = setup(<App />);
      const error = root.querySelector('#error')!;

      expect(error.textContent).toBe('');

      field.setError('Обязательно');
      await waitTime(0);

      expect(error.textContent).toBe('Обязательно');
    });
  });
});
