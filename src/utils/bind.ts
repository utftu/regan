import {Atom} from 'strangelove';

// Атом-источник в управляемом пропе (value, checked, selected) связан в обе
// стороны: regan пишет в элемент и кладёт введённое обратно в атом. Это
// избавляет от обработчика там, где он ничего не решает, — а таких мест
// большинство. Результат select связывать нечем, у него нет set, и он
// остаётся односторонним сам собой.
//
// unbind отменяет обратную запись. Он нужен, когда значением распоряжается
// колбэк: фильтр, маска, проверка перед записью.
//
// Принимает только Atom: у иона писать нечем и отменять нечего, так что
// unbind(select(...)) — ошибка компиляции, а не тихо лишняя обёртка.
export type Unbind<TValue = any> = {
  atom: Atom<TValue>;
  // метка для checkUnbind, как jsxNode у узла и reganError у ошибки.
  // Не instanceof: при двух копиях пакета классы разные, а поле переживёт
  reganUnbind: true;
};

export const unbind = <TValue>(atom: Atom<TValue>): Unbind<TValue> => {
  return {atom, reganUnbind: true};
};

export const checkUnbind = (value: unknown): value is Unbind => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (value as Unbind).reganUnbind === true;
};
