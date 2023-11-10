import {Ctx} from '../../node/ctx/ctx.ts';
import {
  INSERTED_COUNT,
  DYNAMIC_INSERTED_COUNT,
} from '../../node/hydrate/hydrate.ts';
import {FC} from '../../types.ts';

type ObjLike = {
  [INSERTED_COUNT]: typeof DYNAMIC_INSERTED_COUNT | number;
};

const Fragment: FC<any> & ObjLike = (_: any, ctx: Ctx) => {
  return ctx.children;
};

Fragment[INSERTED_COUNT] = DYNAMIC_INSERTED_COUNT;

export {Fragment};
