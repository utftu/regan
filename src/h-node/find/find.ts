import {HNode} from '../h-node.ts';

// HNode - finded
// 'stop' - stop searching
// void - continue searching
export type CheckerAnswer = HNode | 'stop' | void;

export type Checker = (hNode: HNode) => CheckerAnswer;

export type Config = {
  lastParentHNode?: HNode;
};
