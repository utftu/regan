import {HNode} from '../h-node/h-node.ts';
import {DomPointer, StageProps} from '../types.ts';

export type HydrateProps = StageProps & {
  // позиция в уже готовой разметке
  domPointer: DomPointer;
  parentHNode?: HNode;
};

export type HydrateResult = {
  hNode: HNode;
  nodeCount: number;
};
