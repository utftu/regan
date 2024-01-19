import {NEED_AWAIT} from '../../consts.ts';
import {FC, FCParams} from '../../types.ts';

const Fragment: FC & FCParams = (_, {systemProps, children}) => {
  systemProps.needAwait = true;
  return children;
};

Fragment[NEED_AWAIT] = true;

export {Fragment};
