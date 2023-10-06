import {Ctx} from '../../types.ts';
import {
  INSERTED_COUNT,
  DYNAMIC_INSERTED_COUNT,
} from '../../node/hydrate/hydrate.ts';

const Fragment = (_: any, ctx: Ctx) => {
  return ctx.children;
};

Fragment[INSERTED_COUNT] = DYNAMIC_INSERTED_COUNT;

export {Fragment};
