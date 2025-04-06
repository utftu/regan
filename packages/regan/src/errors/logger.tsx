import {JsxNode} from '../jsx-node/jsx-node.ts';
import {FC, Props} from '../types.ts';
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
  console.log('-----', '123', 123);
  if (enabled === false) {
    return children;
  }
  return (
    <ErrorGuardJsx
      errorJsx={({error, jsxNode}) => {
        console.log('-----', 'here', `>>>${error}<<<`, jsxNode);
        logError([
          {name: 'error', value: error},
          {name: 'jsxNode', value: JsxNode},
        ]);
        return createErrorJsxNodeComponent(jsxNode, error);
      }}
    >
      <ErrorGuardHandler
        errorHandler={({error, jsxNode}) => {
          console.log('-----', 'here2', `>>>${error}<<<`, jsxNode);
          console.error(`regan: ${error}`);
        }}
      >
        {children}
      </ErrorGuardHandler>
    </ErrorGuardJsx>
  );
};
