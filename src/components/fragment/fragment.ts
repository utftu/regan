import {Ctx} from '../../node/ctx/ctx.ts';
import {
  INSERTED_COUNT,
  DYNAMIC_INSERTED_COUNT,
} from '../../node/hydrate/hydrate.ts';
import {FC} from '../../types.ts';

const Fragment: FC<any> = (_: any, ctx: Ctx) => {
  return ctx.children;
};

Fragment[INSERTED_COUNT] = DYNAMIC_INSERTED_COUNT;

export {Fragment};
