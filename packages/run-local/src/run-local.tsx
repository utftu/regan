import {ErrorLogger, render} from 'regan';
import {Module1} from './module1.tsx';

const App = () => {
  return (
    <ErrorLogger>
      <Module1 />
      {/* <Complex id='component' /> */}
    </ErrorLogger>
  );
};

render(document.getElementById('app')!, <App />);
