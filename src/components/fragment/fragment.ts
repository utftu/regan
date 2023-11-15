import {DYNAMIC_INSERTED_COUNT, INSERTED_COUNT} from '../../consts.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {FC} from '../../types.ts';

type ObjLike = {
  [INSERTED_COUNT]: number | typeof DYNAMIC_INSERTED_COUNT;
};

const Fragment: FC & ObjLike = (_: any, ctx: Ctx) => {
  return ctx.children;
};

Fragment[INSERTED_COUNT] = DYNAMIC_INSERTED_COUNT;

export {Fragment};
