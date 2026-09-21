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
