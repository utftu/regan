// В CSS свойства через дефис, в JS через горб. Свои свойства (--foo)
// не трогаем.
const formatStyleName = (name: string) => {
  if (name.startsWith('--')) {
    return name;
  }

  let result = '';

  for (const char of name) {
    const lower = char.toLowerCase();
    result += lower === char ? char : `-${lower}`;
  }

  return result;
};

const formatStyle = (style: Record<string, any>) => {
  const parts: string[] = [];

  for (const name in style) {
    const value = style[name];

    if (typeof value !== 'string' && typeof value !== 'number') {
      continue;
    }

    parts.push(`${formatStyleName(name)}: ${value}`);
  }

  return parts.join('; ');
};

// Во что превратить значение пропа в разметке.
// undefined — атрибут ставить не надо, а если он был — снять.
//
// Значением становятся только строки и числа, как и у текстовых детей.
// Булев проп — это присутствие атрибута, а не строка: hidden={false} снимает
// атрибут, а не пишет hidden="false", от которого элемент как раз скрывается.
// Нужна строка — передавай строку: aria-hidden='false'.
export const getAttributeValue = (
  name: string,
  value: any,
): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value === true) {
    return '';
  }

  if (name === 'style' && typeof value === 'object' && value !== null) {
    return formatStyle(value);
  }

  // false, null, undefined и всё прочее атрибутом не становятся
  return;
};

// У этих пропов атрибут — только значение по умолчанию. Как только
// пользователь напечатал в поле или переключил чекбокс, атрибут и свойство
// расходятся навсегда, и через setAttribute полем уже не управлять:
// value={atom} работал бы ровно до первого ввода.
//
// Поэтому на клиенте они пишутся свойством и атрибутом не дублируются.
// В строке из stringify они всё равно атрибуты — других в html нет, и
// гидратация получает из них верное начальное значение.
//
// В таблице: чем заменить пропавший или негодный проп (`value=''` очищает
// поле, `checked=false` снимает галку) и какое событие означает «пользователь
// это изменил» — на нём двусторонняя связка кладёт значение обратно в атом.
const domProperties: Record<
  string,
  Record<string, {empty: string | boolean; event: string}>
> = {
  input: {
    value: {empty: '', event: 'input'},
    checked: {empty: false, event: 'change'},
  },
  textarea: {value: {empty: '', event: 'input'}},
  select: {value: {empty: '', event: 'change'}},
  option: {selected: {empty: false, event: 'change'}},
};

export const checkDomProperty = (element: Element, name: string) => {
  const properties = domProperties[element.localName];

  if (properties === undefined) {
    return false;
  }

  return name in properties;
};

export const getPropertyEvent = (element: Element, name: string) => {
  return domProperties[element.localName][name].event;
};

// Присваивание element.value швыряет каретку в конец строки. Пользователь
// печатал в середине — и следующая буква уедет в хвост. Позицию возвращаем
// со сдвигом на разницу длин: отвергли букву, строка короче на один —
// каретка встаёт ровно туда, где была до неё.
//
// У type=number и type=email выделения нет вовсе: selectionStart там null,
// а setSelectionRange бросает InvalidStateError.
const writeValue = (element: Element, name: string, value: any) => {
  const input = element as HTMLInputElement;
  const position = input.selectionStart;

  if (position === null || typeof value !== 'string') {
    (element as any)[name] = value;
    return;
  }

  const shift = input.value.length - value.length;

  input.value = value;
  input.setSelectionRange(position - shift, position - shift);
};

export const setDomProperty = (element: Element, name: string, value: any) => {
  const known =
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean';

  // null и undefined записывать нельзя: в input.value они превратятся
  // в строки 'null' и 'undefined'
  const newValue = known ? value : domProperties[element.localName][name].empty;

  // сравнение спасает лишнюю запись, а с ней и каретку в тех браузерах,
  // где она уезжает даже от того же самого значения
  if ((element as any)[name] === newValue) {
    return;
  }

  writeValue(element, name, newValue);
};
