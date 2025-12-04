import {Atom} from 'strangelove';
import {FC} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {detachChildren, mountHNodes} from '../../h-node/helpers.ts';
import {rednerRaw} from '../../render/render.ts';
import {getDomPointer} from './dom-pointer.ts';
import {convertFromRtToV} from '../../render/convert/from-rt-to-v.ts';
import {updateV} from './update-v.ts';
import {convertHToV} from './h-to-v.ts';
import {AtomsTracker} from '../../atoms-tracker/atoms-tracker.ts';
import {HNode} from '../../h-node/h-node.ts';
import {convertFromRtToH} from '../../render/convert/from-rt-to-h.ts';
import {RenderTExtended} from '../../render/template.types.ts';
import {subsribeAtomWrapper} from '../../utils/atom.ts';

type Props = {
  atom: Atom;
  atomsTracker?: AtomsTracker;
};

function incrementWithLimit(
  value: number,
  limit: number = Number.MAX_SAFE_INTEGER
): number {
  // Проверяем, что value не NaN и не Infinity
  if (!Number.isFinite(value)) {
    return 0;
  }

  // Если значение достигло или превысило лимит, обнуляем
  if (value >= limit) {
    return 0;
  }

  // Увеличиваем на 1
  return value + 1;
}

export const AtomWrapper: FC<Props> = ({atom}, ctx) => {
  const initPathSegmentName = ctx.segmentEnt.pathSegment.name;

  let updateCount = 0;
  ctx.segmentEnt.pathSegment.name += `?a=0`;

  const cb = (hNode: HNode) => {
    const vOlds = convertHToV(hNode);
    detachChildren(hNode);

    ctx.segmentEnt.pathSegment.clearCache();

    updateCount = incrementWithLimit(updateCount);
    ctx.segmentEnt.pathSegment.name = initPathSegmentName + `?a=${updateCount}`;

    const domPointer = getDomPointer(hNode);

    const {renderTemplate} = rednerRaw({
      node: <Fragment>{atom.get()}</Fragment>,
      parentHNode: hNode,
      window: hNode.globalCtx.clientCtx.window,
      parentSegmentEnt: ctx.segmentEnt,
      domPointer,
    });

    const vNews = convertFromRtToV(renderTemplate);

    updateV({
      vNews,
      vOlds,
      hNode,
      window: hNode.globalCtx.clientCtx.window,
      domPointer,
    });

    const hNodeChild = convertFromRtToH(renderTemplate as RenderTExtended);

    hNode.addChildren([hNodeChild]);

    // logHNodes(hNode);

    mountHNodes(hNodeChild);

    // logHNodes(hNode);
  };

  subsribeAtomWrapper({atom, ctx, cb});

  return <Fragment>{atom.get()}</Fragment>;
};
