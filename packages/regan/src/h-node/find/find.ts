// HNode - finded
// 'stop' - stop searching

import {HNode} from '../h-node.ts';

// void - continue searching
export type CheckerAnswer = HNode | 'stop' | void;

export type Checker = (hNode: HNode) => CheckerAnswer;
