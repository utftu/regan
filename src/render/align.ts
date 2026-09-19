import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {checkClassChild} from '../utils/check-parent.ts';

const getKey = (hNode: HNode) => {
  if (checkClassChild(hNode, 'hNodeText')) {
    return;
  }

  return hNode.segmentEnt?.jsxNode.systemProps.key;
};

// Пара годится, только если старый узел можно переиспользовать как есть:
// другой тег или сырой html — проще создать заново.
// jsxNode не передан — значит это текст.
const checkMatch = (jsxNode: JsxNode | undefined, hNode: HNode) => {
  if (!jsxNode) {
    return checkClassChild(hNode, 'hNodeText');
  }

  if (checkClassChild(jsxNode, 'jsxNodeComponent')) {
    return checkClassChild(hNode, 'hNodeComponent');
  }

  if (checkClassChild(hNode, 'hNodeElement') === false) {
    return false;
  }

  if (hNode.tag !== (jsxNode as JsxNodeElement).tagName) {
    return false;
  }

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

    // узел без ключа берёт следующий свободный старый — тоже без ключа,
    // иначе он забрал бы чужую пару
    while (
      index < oldHNodes.length &&
      (used.has(oldHNodes[index]) || getKey(oldHNodes[index]) !== undefined)
    ) {
      index++;
    }

    const oldHNode = oldHNodes[index];

    if (!oldHNode) {
      return;
    }

    index++;

    if (checkMatch(jsxNode, oldHNode)) {
      used.add(oldHNode);
      return oldHNode;
    }
  };
};
