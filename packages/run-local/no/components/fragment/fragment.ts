import {NEED_AWAIT} from '../../consts.ts';
import {FC, FCStaticParams} from '../../types.ts';

const Fragment: FC & FCStaticParams = (_, {children}) => {
  return children;
};

Fragment[NEED_AWAIT] = true;

export {Fragment};
