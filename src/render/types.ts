import {HNode} from '../h-node/h-node.ts';
import {StageProps} from '../types.ts';
import {RenderNode} from './node.ts';

export type RenderProps = StageProps & {
  // пара этого узла в прошлом дереве, если она нашлась
  oldHNode?: HNode;
};

export type RenderResult = {
  renderNode: RenderNode;
};
