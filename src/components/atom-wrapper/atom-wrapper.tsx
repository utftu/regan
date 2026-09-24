import {Ion} from 'strangelove';
import {FC} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {renderRaw} from '../../render/render.ts';
import {getInsertPoint} from './insert-point.ts';
import {applyRenderNodes} from '../../render/apply.ts';
import {HNode} from '../../h-node/h-node.ts';
import {subscribeAtomWrapper} from './subscribe.ts';
import {HNodeText} from '../../h-node/text.ts';
import {checkAllowedPrimitive} from '../../utils/jsx.ts';
import {handleError} from '../../errors/handle.ts';

type Props = {
  atom: Ion;
};

// содержимое обёртки — ровно один текстовый узел, значит его можно обновить
// записью в textContent, не пересобирая поддерево
function findSingleTextHNode(hNode: HNode): HNodeText | undefined {
  if (hNode.type === 'text') {
    return hNode;
  }

  if (hNode.type === 'element') {
    return;
  }

  if (hNode.children.length !== 1) {
    return;
  }

  return findSingleTextHNode(hNode.children[0]);
}

export const AtomWrapper: FC<Props> = ({atom}, ctx) => {
  const initPathSegmentName = ctx.segmentEnt.name;

  let updateCount = 0;
  ctx.segmentEnt.name += `?a=0`;

  let progress = false;
  let pending = false;
  // сколько падений подряд: каждое следующее уходит на ErrorGuard выше,
  // иначе упавший запасной вариант зациклил бы сам себя
  let failCount = 0;

  const cb = (hNode: HNode) => {
    // Check if node is already unmounted
    if (hNode.unmounted) {
      return;
    }
    // AtomWrapper runs only on client; skip if clientCtx is missing (e.g. SSR edge case)
    const clientCtx = hNode.globalCtx.clientCtx;
    if (!clientCtx) {
      return;
    }
    if (progress) {
      pending = true;
      return;
    }

    const value = atom.get();
    const textHNode = findSingleTextHNode(hNode);

    if (textHNode && checkAllowedPrimitive(value)) {
      textHNode.text = value.toString();
      textHNode.textNode.textContent = textHNode.text;
      return;
    }

    progress = true;
    // старое дерево не разбираем: рендер сверит его с новым и сам решит,
    // что переиспользовать, что сохранить целиком, а что размонтировать
    const oldHNodes = [...hNode.children];

    updateCount++;
    ctx.segmentEnt.name = initPathSegmentName + `?a=${updateCount}`;

    const insertPoint = getInsertPoint(hNode);
    const window = clientCtx.window;

    try {
      const {renderNode} = renderRaw({
        node: <Fragment>{value}</Fragment>,
        parentHNode: hNode,
        window,
        parentSegmentEnt: ctx.segmentEnt,
        insertPoint,
        oldHNode: oldHNodes[0],
      });

      const {hNodes, created} = applyRenderNodes({
        renderNodes: [renderNode],
        oldHNodes,
        insertPoint,
        window,
        parent: hNode,
      });

      hNode.children = hNodes;

      created.forEach((createdHNode) => createdHNode.mount());

      failCount = 0;
    } catch (error) {
      // старое дерево цело: падение случилось на рендере, до правок дома
      const {handled, error: errorRegan} = handleError({
        error,
        place: 'component',
        segmentEnt: ctx.segmentEnt,
        skip: failCount,
      });
      failCount++;

      if (handled === false) {
        // перехватить некому — прятать ошибку нельзя. Бросаем завёрнутую:
        // в ней лежит путь, апдейтер его покажет
        throw errorRegan;
      }
    } finally {
      progress = false;
    }

    if (pending) {
      pending = false;
      cb(hNode);
    }
  };

  subscribeAtomWrapper({atom, ctx, cb});

  return <Fragment>{atom.get()}</Fragment>;
};

AtomWrapper.reganInternal = true;
