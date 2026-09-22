import {ErrorHandler, getErrorContext} from '../errors/errors.ts';
import {Child, FC} from '../types.ts';
import {createAtom} from 'strangelove';

type Props = {
  handler: ErrorHandler;
};

export const ErrorGuard: FC<Props> = ({handler}, {children}) => {
  const Provider = getErrorContext().Provider;
  const childrenAtom = createAtom<Child>(children);

  return (
    <Provider
      // Глобальные обработчики оповещает handleError — один раз на ошибку.
      value={(props) => {
        childrenAtom.set(handler(props));
      }}
    >
      {childrenAtom}
    </Provider>
  );
};

ErrorGuard.reganInternal = true;
