import {Atom} from 'strangelove';

// Атом в управляемом пропе (value, checked, selected) связан в обе стороны:
// regan пишет в элемент и кладёт введённое обратно в атом. Это избавляет от
// обработчика там, где он ничего не решает, — а таких мест большинство.
//
// notBind отменяет обратную запись. Он нужен, когда значением распоряжается
// колбэк: фильтр, маска, проверка перед записью. И он же обязателен для
// производного атома (select) — писать в такой нельзя, а отличить его от
// источника снаружи нечем, exec есть у обоих.
export type NotBind<TValue = any> = {
  reganNotBind: Atom<TValue>;
};

export const notBind = <TValue>(atom: Atom<TValue>): NotBind<TValue> => {
  return {reganNotBind: atom};
};

// Поле-маркер, а не instanceof: две копии пакета в дереве зависимостей
// ломают проверку по классу.
export const checkNotBind = (value: unknown): value is NotBind => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (value as NotBind).reganNotBind !== undefined;
};
