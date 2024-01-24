import {NEED_AWAIT} from '../../consts.ts';
import {FC, FCStaticParams} from '../../types.ts';

const Fragment: FC & FCStaticParams = (_, {systemProps, children}) => {
  systemProps.needAwait = true;
  return children;
};

Fragment[NEED_AWAIT] = true;

export {Fragment};
