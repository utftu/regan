import {Ctx} from '../ctx/ctx.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export class HNodeComponent extends HNodeBase {
  ctx: Ctx;
  constructor(props: PropsHNode, {ctx}: {ctx: Ctx}) {
    super(props);
    this.ctx = ctx;
  }
}
