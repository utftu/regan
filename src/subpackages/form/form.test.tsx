import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {waitTime} from 'utftu';
import {render} from '../../render/render.ts';
import {FC} from '../../types.ts';
import {createField} from './field.ts';
import {createForm} from './form.ts';

const required = (value: string) => (value === '' ? 'Обязательно' : undefined);

const setup = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);
  render(root, jsxNode, {window: jsdom.window as any as Window});

  return root;
};

const createTestForm = () => {
  return createForm({
    fields: {
      name: createField({value: 'Робин', validate: required}),
      age: createField({value: 42}),
    },
  });
};

describe('Form', () => {
  it('значения собираются из полей', () => {
    const form = createTestForm();

    expect(form.values.get()).toEqual({name: 'Робин', age: 42});
  });

  it('значения пересчитываются при изменении поля', () => {
    const form = createTestForm();

    form.fields.name.set('Мэриан');

    expect(form.values.get()).toEqual({name: 'Мэриан', age: 42});
  });

  it('ошибки собираются из полей', () => {
    const form = createTestForm();

    expect(form.errors.get()).toEqual({name: '', age: ''});

    form.fields.name.set('');
    form.fields.name.validate();

    expect(form.errors.get()).toEqual({name: 'Обязательно', age: ''});
  });

  it('valid показывает, есть ли показанные ошибки', () => {
    const form = createTestForm();

    expect(form.valid.get()).toBe(true);

    form.fields.name.set('');
    form.fields.name.validate();

    expect(form.valid.get()).toBe(false);

    form.fields.name.set('Робин');

    expect(form.valid.get()).toBe(true);
  });

  it('validate прогоняет все поля и отдаёт итог', () => {
    const first = createField({value: '', validate: required});
    const second = createField({value: '', validate: required});
    const form = createForm({fields: {first, second}});

    expect(form.validate()).toBe(false);

    // обе ошибки показаны сразу, а не по одной за отправку
    expect(first.error.get()).toBe('Обязательно');
    expect(second.error.get()).toBe('Обязательно');
  });

  it('reset возвращает поля к начальному', () => {
    const form = createTestForm();

    form.fields.name.set('');
    form.fields.name.validate();
    form.fields.name.setTouched(true);
    form.reset();

    expect(form.values.get()).toEqual({name: 'Робин', age: 42});
    expect(form.errors.get()).toEqual({name: '', age: ''});
    expect(form.fields.name.touched.get()).toBe(false);
  });

  describe('submit', () => {
    it('отдаёт значения обработчику', async () => {
      const onSubmit = vi.fn();
      const form = createForm({
        fields: {name: createField({value: 'Робин', validate: required})},
        onSubmit,
      });

      await form.submit();

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].values).toEqual({name: 'Робин'});
      expect(onSubmit.mock.calls[0][0].form).toBe(form);
    });

    it('не зовёт обработчик, когда форма не прошла проверку', async () => {
      const onSubmit = vi.fn();
      const form = createForm({
        fields: {name: createField({value: '', validate: required})},
        onSubmit,
      });

      await form.submit();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(form.valid.get()).toBe(false);
    });

    it('делает все поля тронутыми — ошибки обязаны показаться', async () => {
      const name = createField({value: '', validate: required});
      const form = createForm({fields: {name}});

      await form.submit();

      expect(name.touched.get()).toBe(true);
      expect(name.error.get()).toBe('Обязательно');
    });

    it('submitting поднят на время обработчика и опущен после', async () => {
      const states: boolean[] = [];
      const form = createForm({
        fields: {name: createField({value: 'Робин'})},
        onSubmit: async () => {
          states.push(form.submitting.get());
          await waitTime(0);
        },
      });

      const promise = form.submit();

      expect(form.submitting.get()).toBe(true);

      await promise;

      expect(states).toEqual([true]);
      expect(form.submitting.get()).toBe(false);
    });

    it('падение обработчика опускает submitting и летит наружу', async () => {
      const form = createForm({
        fields: {name: createField({value: 'Робин'})},
        onSubmit: () => {
          throw new Error('сеть');
        },
      });

      expect(form.submit()).rejects.toThrow('сеть');
      await waitTime(0);

      expect(form.submitting.get()).toBe(false);
    });

    it('годится обработчиком <form>: отменяет отправку страницы', async () => {
      const onSubmit = vi.fn();
      const form = createForm({
        fields: {name: createField({value: 'Робин'})},
        onSubmit,
      });

      const App: FC = () => (
        <form id='form' submit={form.submit}>
          <input {...form.fields.name.getInput()} />
        </form>
      );

      const element = setup(<App />).querySelector('form')!;
      const window = element.ownerDocument.defaultView as any;
      const event = new window.Event('submit', {cancelable: true});

      element.dispatchEvent(event);
      await waitTime(0);

      expect(event.defaultPrevented).toBe(true);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('разметка подписывается на итог, а не на каждое поле', async () => {
    const form = createTestForm();
    const App: FC = () => (
      <button id='button' disabled={form.valid}>
        ок
      </button>
    );

    const button = setup(<App />).querySelector('button')!;

    expect(button.hasAttribute('disabled')).toBe(true);

    form.fields.name.set('');
    form.fields.name.validate();
    await waitTime(0);

    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('destroy снимает производные с полей', () => {
    const name = createField({value: 'Робин'});
    const form = createForm({fields: {name}});

    // values читает value, errors и valid — error
    expect(name.value.relations.children.size).toBe(1);
    expect(name.error.relations.children.size).toBe(2);

    form.destroy();

    expect(name.value.relations.children.size).toBe(0);
    expect(name.error.relations.children.size).toBe(0);
  });
});
