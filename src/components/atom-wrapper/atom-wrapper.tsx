import {Atom} from 'strangelove';
import {FC} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {detachChildren, mountHNodes} from '../../h-node/helpers.ts';
import {renderRaw} from '../../render/render.ts';
import {getInsertPoint} from './insert-point.ts';
import {convertFromRtToV} from '../../render/convert/from-rt-to-v.ts';
import {virtualApply} from '../../v/v.ts';
import {convertHToV} from './h-to-v.ts';
import {HNode} from '../../h-node/h-node.ts';
import {convertFromRtToH} from '../../render/convert/from-rt-to-h.ts';
import {RenderTExtended} from '../../render/template.types.ts';
import {subscribeAtomWrapper} from '../../utils/atom.ts';
import {HNodeText} from '../../h-node/text.ts';
import {checkClassChild} from '../../utils/check-parent.ts';
import {checkAllowedPrivitive} from '../../utils/jsx.ts';

type Props = {
  atom: Atom;
};

// содержимое обёртки — ровно один текстовый узел, значит его можно обновить
// записью в textContent, не пересобирая поддерево
function findSingleTextHNode(hNode: HNode): HNodeText | undefined {
  if (checkClassChild(hNode, 'hNodeText')) {
    return hNode;
  }

  if (checkClassChild(hNode, 'hNodeElement')) {
    return;
  }

  if (hNode.children.length !== 1) {
    return;
  }

  return findSingleTextHNode(hNode.children[0]);
}

export const AtomWrapper: FC<Props> = ({atom}, ctx) => {
  const initPathSegmentName = ctx.segmentEnt.pathSegment.name;

  let updateCount = 0;
  ctx.segmentEnt.pathSegment.name += `?a=0`;

  let progress = false;
  let pending = false;

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

    if (textHNode && checkAllowedPrivitive(value)) {
      textHNode.text = value.toString();
      textHNode.textNode.textContent = textHNode.text;
      return;
    }

    progress = true;
    const vOlds = convertHToV(hNode);
    detachChildren(hNode);

    ctx.segmentEnt.pathSegment.clearCache();

    updateCount++;
    ctx.segmentEnt.pathSegment.name = initPathSegmentName + `?a=${updateCount}`;

    const insertPoint = getInsertPoint(hNode);
    const window = clientCtx.window;

    const {renderTemplate} = renderRaw({
      node: <Fragment>{value}</Fragment>,
      parentHNode: hNode,
      window,
      parentSegmentEnt: ctx.segmentEnt,
      insertPoint,
    });

    const vNews = convertFromRtToV(renderTemplate);

    virtualApply({
      vNews,
      vOlds,
      window,
      insertPoint,
    });

    const hNodeChild = convertFromRtToH(renderTemplate as RenderTExtended);

    hNode.addChildren([hNodeChild]);

    mountHNodes(hNodeChild);

    progress = false;
    if (pending) {
      pending = false;
      cb(hNode);
    }
  };

  subscribeAtomWrapper({atom, ctx, cb});

  return <Fragment>{atom.get()}</Fragment>;
};
