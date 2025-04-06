import {ContextEnt} from '../context/context.tsx';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-atoms-snapshot.ts';

export type StringContext = {
  snapshot: TreeAtomsSnapshot;
};

export type GetStringStreamProps = {
  globalCtx: GlobalCtx;
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  parentContextEnt?: ContextEnt;
  stringContext: StringContext;
};
