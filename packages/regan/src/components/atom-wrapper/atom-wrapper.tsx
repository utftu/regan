import {Atom} from 'strangelove';
import {FC} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {subsribeAtom} from '../../utils/atom.ts';
import {detachChildren, mountHNodes} from '../../h-node/helpers.ts';
import {rednerBasic} from '../../render/render.ts';
import {getDomPointer} from './dom-pointer.ts';
import {convertFromRtToV} from '../../render/convert/from-rt-to-v.ts';
import {updateV} from './update-v.ts';
import {convertHToV} from './h-to-v.ts';
import {AtomsTracker} from '../../atoms-tracker/atoms-tracker.ts';
import {a} from 'vite-node/dist/index-O2IrwHKf.js';
import {subsribeAtomWrapper} from './subsribe.ts';
import {HNode} from '../../h-node/h-node.ts';
import {convertFromRtToH} from '../../render/convert/from-rt-to-h.ts';
import {RenderTemplateExtended} from '../../render/template.types.ts';

type Props = {
  atom: Atom;
  atomsTracker?: AtomsTracker;
};

const getAdditionalPart = (initRun: boolean) => {
  if (initRun) {
    return '?a=0';
  }

  return `?a=${Date.now()}`;
};

export const AtomWrapper: FC<Props> = ({atom, atomsTracker}, ctx) => {
  const initPathSegmentName = ctx.segmentEnt.pathSegment.name;
  ctx.segmentEnt.pathSegment.name += getAdditionalPart(true);

  if (atomsTracker) {
    subsribeAtomWrapper({
      atom,
      atomsTracker,
      ctx,
      cb: (hNode: HNode) => {
        detachChildren(hNode);

        ctx.segmentEnt.pathSegment.clearCache();

        ctx.segmentEnt.pathSegment.name =
          initPathSegmentName + getAdditionalPart(false);

        const domPointer = getDomPointer(hNode);

        const {renderTemplate} = rednerBasic({
          node: <Fragment>{atom.get()}</Fragment>,
          parentHNode: hNode,
          window: hNode.globalClientCtx.window,
          parentSegmentEnt: ctx.segmentEnt,
          domPointer,
        });

        const vNews = convertFromRtToV(renderTemplate);
        const vOlds = convertHToV(hNode);

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

        mountHNodes(hNodeChild);
      },
    });
  }

  ctx.mount((hNode) => {
    atom.listeners.subscribe(() => {
      detachChildren(hNode);

      ctx.segmentEnt.pathSegment.clearCache();

      ctx.segmentEnt.pathSegment.name =
        initPathSegmentName + getAdditionalPart(false);

      const domPointer = getDomPointer(hNode);

      const {renderTemplate} = rednerBasic({
        node: <Fragment>{atom.get()}</Fragment>,
        parentHNode: hNode,
        window: hNode.globalClientCtx.window,
        parentSegmentEnt: ctx.segmentEnt,
        domPointer,
      });

      const vNews = convertFromRtToV(renderTemplate);
      const vOlds = convertHToV(hNode);

      updateV({
        vNews,
        vOlds,
        hNode,
        window: hNode.globalClientCtx.window,
        domPointer,
      });
    });
  });

  return <Fragment>{atom.get()}</Fragment>;
};
