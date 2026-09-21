import {createErrorRegan} from '../errors/errors.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';
import {
  checkAllowedPrimitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {JsxNode} from './jsx-node.ts';

// Разбор детей из JSX — один на все три стадии.
//
// Правила тут одни и те же, и это важнее экономии строк: пока они жили в
// трёх копиях, стадии успели разойтись и по пустой строке, и по разделителям
// между текстами. Что делать с разобранным — у каждой стадии своё.
export function walkChildren({
  children,
  parentSegmentEnt,
  text,
  node,
}: {
  children: SingleChild[];
  parentSegmentEnt: SegmentEnt;
  text: (text: string) => void;
  // jsxSegmentName — номер среди детей, ставших узлами; текст его не получает
  // и не увеличивает, потому что своего segmentEnt у него нет
  node: (jsxNode: JsxNode, jsxSegmentName: string) => void;
}) {
  let insertedJsxCount = 0;

  for (const child of children) {
    // функцию сначала зовём: ленивый ребёнок отдаёт значение только так
    const value = formatJsxValue(child);

    // null, undefined, boolean и пустая строка узла не дают ни на одной
    // стадии — иначе стадии разошлись бы по количеству узлов
    if (checkPassPrimitive(value)) {
      continue;
    }

    if (checkAllowedPrimitive(value)) {
      text(value.toString());
      continue;
    }

    if (checkAllowedStructure(value) === false) {
      // в сообщение идёт тип и место, а не значение: symbol в строку не
      // превращается вовсе, а от объекта строка всё равно ничего не скажет
      throw createErrorRegan({
        error: `Invalid child of type ${typeof value} in ${parentSegmentEnt.getNamedPath()}`,
        place: 'jsx',
        segmentEnt: parentSegmentEnt,
      });
    }

    // атом и массив сами узлами не являются — заворачиваем в компонент
    node(wrapChildIfNeed(value), insertedJsxCount.toString());
    insertedJsxCount++;
  }
}
