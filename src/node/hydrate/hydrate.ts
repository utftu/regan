import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNode} from '../../h-node/h-node.ts';
import {ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {DomProps} from '../node.ts';

export type HContext = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type HydrateProps = {
  dom: DomProps;
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: ParentJsxSegment;
  hContext: HContext;
};
