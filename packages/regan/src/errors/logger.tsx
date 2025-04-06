import {FC} from '../types.ts';
import {ErrorGuardHandler, ErrorGuardJsx} from './errors.tsx';
import {createErrorJsxNodeComponent} from './helpers.ts';

const logError = (points: {name: string; value: any}[]) => {
  let str = 'regan: Error';

  points.forEach(({name, value}) => {
    str += `\n  ${name}: ${value}`;
  });
};

export const ErrorLogger: FC<{enabled?: boolean}> = (
  {enabled = true},
  {children}
) => {
  if (enabled === false) {
    return children;
  }
  return (
    <ErrorGuardJsx
      errorJsx={({error, jsxNode}) => {
        logError([
          {name: 'error', value: error},
          {name: 'jsxNode', value: jsxNode},
        ]);
        return createErrorJsxNodeComponent(jsxNode, error);
      }}
    >
      <ErrorGuardHandler
        errorHandler={({error, jsxNode}) => {
          logError([
            {name: 'error', value: error},
            {name: 'jsxNode', value: jsxNode},
          ]);
          console.error(`regan: ${error}`);
        }}
      >
        {children}
      </ErrorGuardHandler>
    </ErrorGuardJsx>
  );
};
