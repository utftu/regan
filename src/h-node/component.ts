import {HNodeBase} from './h-node.ts';

export class HNodeComponent extends HNodeBase {
  type = 'component' as const;
}
