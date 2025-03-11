import {Ctx} from '../ctx/ctx.ts';
import {HNode} from '../h-node/h-node.ts';

export const createSmartMount = (ctx: Ctx, hNode: HNode) => {
  const unmounts = ctx.state.mounts.map((mount) => mount());

  hNode.unmounts.push(...unmounts);
};
