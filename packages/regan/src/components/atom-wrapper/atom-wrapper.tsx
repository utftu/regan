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
import {RenderTemplateExtended} from '../../render/template.types.ts';
import {subsribeAtomStages, subsribeAtomWrapper} from '../../utils/atom.ts';
import {C} from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

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

  // const subsribeAtomStages1 = subsribeAtomStages({
  //   atom,
  //   globalCtx: ctx.globalCtx,
  // });

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
      window: hNode.globalClientCtx.window,
      parentSegmentEnt: ctx.segmentEnt,
      domPointer,
    });

    const vNews = convertFromRtToV(renderTemplate);

    updateV({
      vNews,
      vOlds,
      hNode,
      window: hNode.globalClientCtx.window,
      domPointer,
    });

    const hNodeChild = convertFromRtToH(
      renderTemplate as RenderTemplateExtended
    );

    hNode.addChildren([hNodeChild]);

    mountHNodes(hNodeChild);
  };

  subsribeAtomWrapper({atom, ctx, cb});

  // ctx.mount((hNode) => {
  //   subsribeAtomStages1(hNode, cb);
  // });

  // if (ctx.client?.hNode) {
  //   const cb = (hNode: HNode) => {
  //     const vOlds = convertHToV(hNode);
  //     detachChildren(hNode);

  //     ctx.segmentEnt.pathSegment.clearCache();

  //     updateCount = incrementWithLimit(updateCount);
  //     ctx.segmentEnt.pathSegment.name =
  //       initPathSegmentName + `?a=${updateCount}`;

  //     const domPointer = getDomPointer(hNode);

  //     const {renderTemplate} = rednerRaw({
  //       node: <Fragment>{atom.get()}</Fragment>,
  //       parentHNode: hNode,
  //       window: hNode.globalClientCtx.window,
  //       parentSegmentEnt: ctx.segmentEnt,
  //       domPointer,
  //     });

  //     const vNews = convertFromRtToV(renderTemplate);

  //     updateV({
  //       vNews,
  //       vOlds,
  //       hNode,
  //       window: hNode.globalClientCtx.window,
  //       domPointer,
  //     });

  //     const hNodeChild = convertFromRtToH(
  //       renderTemplate as RenderTemplateExtended
  //     );

  //     hNode.addChildren([hNodeChild]);

  //     mountHNodes(hNodeChild);
  //   };
  //   subsribeAtomStages({atom, globalCtx: ctx.globalCtx})(ctx.client.hNode, cb);
  // }

  return <Fragment>{atom.get()}</Fragment>;
};
