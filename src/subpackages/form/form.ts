import {Atom, createAtom, destroyIon, Ion, select} from 'strangelove';
import {Field} from './field.ts';

export type Fields = Record<string, Field<any>>;

export type Values<TFields extends Fields> = {
  [TName in keyof TFields]: TFields[TName] extends Field<infer TValue>
    ? TValue
    : never;
};

export type Errors<TFields extends Fields> = Record<keyof TFields, string>;

export type Submit<TFields extends Fields> = (props: {
  values: Values<TFields>;
  form: Form<TFields>;
}) => void | Promise<void>;

export type FormProps<TFields extends Fields> = {
  fields: TFields;
  onSubmit?: Submit<TFields>;
};

// Форма — это набор именованных полей и три производных значения над ними.
// Поля она не создаёт: их приносят готовыми, поэтому набор закрыт и типы
// выводятся из него (form.fields.age.value — Atom<number>, а не Atom<any>).
//
// values, errors и valid — производные атомы: {form.valid} в разметке
// подписывается на итог, а не на каждое поле по отдельности. За производные
// платит тот, кто их создал, поэтому у формы есть destroy.
export class Form<TFields extends Fields = Fields> {
  fields: TFields;
  values: Ion<Values<TFields>>;
  errors: Ion<Errors<TFields>>;
  valid: Ion<boolean>;
  submitting: Atom<boolean>;

  private props: FormProps<TFields>;

  constructor(props: FormProps<TFields>) {
    this.props = props;
    this.fields = props.fields;
    this.submitting = createAtom(false);

    this.values = select((get) => {
      const values = {} as Values<TFields>;

      for (const name in this.fields) {
        values[name] = get(this.fields[name].value);
      }

      return values;
    });

    this.errors = select((get) => {
      const errors = {} as Errors<TFields>;

      for (const name in this.fields) {
        errors[name] = get(this.fields[name].error);
      }

      return errors;
    });

    // Считается по ошибкам, которые уже показаны, а не по прогону проверок:
    // проверка — действие, а вычисление обязано быть чистым. Поэтому до
    // первого validate() форма считается годной.
    this.valid = select((get) => {
      for (const name in this.fields) {
        if (get(this.fields[name].error) !== '') {
          return false;
        }
      }

      return true;
    });
  }

  // Прогоняет все проверки, а не останавливается на первой: человек должен
  // увидеть все ошибки сразу, а не по одной за отправку.
  validate(): boolean {
    let valid = true;

    for (const name in this.fields) {
      if (this.fields[name].validate() !== '') {
        valid = false;
      }
    }

    return valid;
  }

  reset(): void {
    for (const name in this.fields) {
      this.fields[name].reset();
    }

    this.submitting.set(false);
  }

  // Стрелка, а не метод: её передают обработчиком — <form submit={form.submit}>.
  //
  // Перед проверкой все поля становятся тронутыми: ошибки, спрятанные до
  // первого захода в поле, на отправке обязаны показаться.
  submit = async ({event}: {event?: Event} = {}): Promise<void> => {
    event?.preventDefault();

    for (const name in this.fields) {
      this.fields[name].setTouched(true);
    }

    if (this.validate() === false) {
      return;
    }

    if (this.props.onSubmit === undefined) {
      return;
    }

    this.submitting.set(true);

    try {
      await this.props.onSubmit({values: this.values.get(), form: this});
    } finally {
      this.submitting.set(false);
    }
  };

  // Зовёт тот, кто форму создал, — на размонтировании. Нужно, только если
  // поля переживут форму: производные висят на их атомах и без этого
  // остаются в графе навсегда.
  destroy(): void {
    destroyIon(this.values);
    destroyIon(this.errors);
    destroyIon(this.valid);
  }
}

export function createForm<TFields extends Fields>(
  props: FormProps<TFields>,
): Form<TFields> {
  return new Form(props);
}
