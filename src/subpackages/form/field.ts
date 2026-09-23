import {Atom, createAtom} from 'strangelove';

// Проверка одного значения: вернула строку — это ошибка, не вернула ничего —
// всё в порядке. Писать `return ''` не нужно.
export type Validate<TValue> = (value: TValue) => string | undefined;

export type FieldProps<TValue> = {
  value: TValue;
  validate?: Validate<TValue>;
  touched?: boolean;
  error?: string;
};

// Пропы для <input {...field.getInput()} />.
export type InputProps = {
  value: Atom<string>;
  blur: () => void;
};

// Поле само по себе — форма ему не нужна. Значение, ошибка и «трогали ли» —
// три отдельных атома, поэтому {field.error} в разметке подписывается на
// ошибку, а не на поле целиком.
//
// Ошибка всегда строка: пусто — это ''. Снаружи её можно не возвращать, но
// внутри объединений нет, и form.errors — обычный Record<string, string>.
export class Field<TValue = any> {
  value: Atom<TValue>;
  error: Atom<string>;
  touched: Atom<boolean>;

  private props: FieldProps<TValue>;

  constructor(props: FieldProps<TValue>) {
    this.props = props;
    this.value = createAtom(props.value);
    this.error = createAtom(props.error ?? '');
    this.touched = createAtom(props.touched ?? false);

    // Показанная ошибка пересчитывается на каждое изменение значения: её
    // убирают в тот момент, когда починили. Пока ошибки нет, молчим — ругаться
    // на поле, в котором ещё печатают, рано.
    //
    // Подписка на свой же атом, оба умрут вместе.
    this.value.listeners.subscribe(() => {
      if (this.error.get() !== '') {
        this.validate();
      }
    });
  }

  // Просто кладёт значение: проверять или нет — решает тот, кто зовёт.
  set(value: TValue): void {
    this.value.set(value);
  }

  setError(error: string | undefined): void {
    this.error.set(error ?? '');
  }

  setTouched(touched: boolean): void {
    this.touched.set(touched);
  }

  validate(): string {
    if (this.props.validate === undefined) {
      return '';
    }

    const error = this.props.validate(this.value.get()) ?? '';
    this.error.set(error);

    return error;
  }

  reset(): void {
    this.value.set(this.props.value);
    this.error.set(this.props.error ?? '');
    this.touched.set(this.props.touched ?? false);
  }

  // this: Field<string> — в input пользователь вводит строку, и класть её
  // в поле, объявленное числом, нечестно. Числовому полю обработчики пишутся
  // руками, вместе с разбором.
  getInput(this: Field<string>): InputProps {
    return {
      value: this.value,
      blur: () => {
        this.setTouched(true);
        this.validate();
      },
    };
  }
}

export function createField<TValue>(props: FieldProps<TValue>): Field<TValue> {
  return new Field(props);
}
