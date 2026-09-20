import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';

const getKey = (hNode: HNode) => {
  if (hNode.type === 'text') {
    return;
  }

  return hNode.segmentEnt?.jsxNode.systemProps.key;
};

// Годится ли старый узел в пару новому.
//
// Вопрос ровно один: можно ли переиспользовать его как есть. Не «похожи ли
// они» — а «выйдет ли из старого новый, если пропатчить пропы и детей».
// Ответ «нет» стоит недорого: старый уедет в удаление, новый создастся с нуля.
// Это единственное место, где такое решается — в apply проверок нет,
// он доверяет паре, которую здесь одобрили.
const checkMatch = (jsxNode: JsxNode | undefined, hNode: HNode) => {
  // У текста нет своего JsxNode — такого класса в regan просто не существует.
  // Примитивный ребёнок минует wrapChildIfNeed и сразу становится
  // RenderNodeText, обернуть есть что только атом и массив. Поэтому передать
  // сюда нечего ровно в одном случае — когда ребёнок текстовый.
  // Парится он только с текстом: патчить у него нечего, кроме textContent.
  if (!jsxNode) {
    return hNode.type === 'text';
  }

  // Компоненту хватает того, что напротив тоже компонент. Какая именно
  // функция за ним стоит, здесь не важно: если другая, компонент просто
  // отрендерится заново, а его дети разберутся на своём уровне тем же
  // сопоставителем. Личность функции проверяет только checkKeep —
  // там от неё зависит, запускать тело или нет.
  if (jsxNode.type === 'component') {
    return hNode.type === 'component';
  }

  // Дальше новый узел — элемент. Значит и старый должен быть элементом:
  // ни текст, ни компонент элементом не станут.
  if (hNode.type !== 'element') {
    return false;
  }

  // Тег сменить нельзя — в DOM это другой узел. Из <div> не выйдет <span>,
  // как бы ни патчить пропы.
  if (hNode.tag !== jsxNode.tagName) {
    return false;
  }

  // rawHtml кладётся через innerHTML, и что там внутри — regan не знает:
  // HNode для этого содержимого не строился, детей сверять не с чем.
  // Поэтому элемент с rawHtml всегда создаётся заново.
  return typeof jsxNode.systemProps.rawHtml !== 'string';
};

// Подбирает каждому новому ребёнку старый — по ходу обхода, по одному.
// Без ключей это сравнение по позиции, с ключами узел находит свою пару,
// даже если переехал.
export const createMatcher = (oldHNodes: HNode[]) => {
  if (oldHNodes.length === 0) {
    return () => undefined;
  }

  let keyed: Map<string, HNode> | undefined;

  for (const oldHNode of oldHNodes) {
    const key = getKey(oldHNode);

    if (key === undefined) {
      continue;
    }

    keyed ??= new Map();
    // при дублях выигрывает первый — так же, как при сравнении по позиции
    if (keyed.has(key) === false) {
      keyed.set(key, oldHNode);
    }
  }

  const used = new Set<HNode>();
  let index = 0;

  return (jsxNode?: JsxNode): HNode | undefined => {
    const key = jsxNode?.systemProps.key;

    if (key !== undefined && keyed) {
      const oldHNode = keyed.get(key);

      if (oldHNode && !used.has(oldHNode) && checkMatch(jsxNode, oldHNode)) {
        used.add(oldHNode);
        return oldHNode;
      }

      return;
    }

    // Узла без ключа ждёт сравнение по позиции. index — курсор по старому
    // списку, он только растёт: каждый старый узел предлагается ровно один
    // раз, поэтому весь проход по детям линейный.

    // Пропускаем те, которые этому узлу не полагаются:
    //   used — уже забрал кто-то по ключу. Ключ ищет свою пару где угодно,
    //     в том числе далеко впереди курсора, так что занятое встречается
    //     и до, и после текущей позиции;
    //   с ключом — зарезервирован. Его может спросить ребёнок, до которого
    //     мы ещё не дошли, и отдавать такой узел позиционно нельзя.
    while (
      index < oldHNodes.length &&
      (used.has(oldHNodes[index]) || getKey(oldHNodes[index]) !== undefined)
    ) {
      index++;
    }

    // Старые кончились: это добавленный ребёнок, пары у него нет и не будет.
    const oldHNode = oldHNodes[index];

    if (!oldHNode) {
      return;
    }

    // Курсор двигаем до проверки, а не после. Этот старый узел принадлежит
    // этой позиции — независимо от того, подошёл он или нет. Если не подошёл
    // (был <div>, стал <span>), предлагать его следующему ребёнку нельзя:
    // тот сдвинулся бы на позицию назад и утащил бы за собой весь хвост.
    index++;

    // Подошёл — помечаем занятым. Не подошёл — молча остаётся вне used,
    // и apply удалит его как непарного. Отдельно сообщать об этом не нужно.
    if (checkMatch(jsxNode, oldHNode)) {
      used.add(oldHNode);
      return oldHNode;
    }
  };
};
