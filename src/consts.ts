import {Data} from './types.ts';

export const defaultData: Data = {
  envs: {},
  props: {},
};

// SSR склеивает соседние тексты в один DOM-узел: браузер парсит "a" + "b" как
// один Text. Разделитель возвращает каждому текстовому ребёнку свой узел.
// Гидратация его удаляет, поэтому дальше о нём никто не знает.
export const textSeparator = '<!---->';

export const commentNodeType = 8;
