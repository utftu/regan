import {ErrorHandler, getErrorContext} from '../errors/errors.tsx';
import {Child, FC} from '../types.ts';
import {createAtom} from 'strangelove';

type Props = {
  handler: ErrorHandler;
};

export const ErrorGuard: FC<Props> = ({handler}, {children, globalCtx}) => {
  const Provider = getErrorContext().Provider;
  const childrenAtom = createAtom<Child>(children);

  return (
    <Provider
      value={(props) => {
        const result = handler(props);

        globalCtx.errorHandlers.forEach((handler) => {
          handler({...props, handled: true});
        });
        childrenAtom.set(result);
      }}
    >
      {childrenAtom}
    </Provider>
  );
};
