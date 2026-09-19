import {ErrorLogger, render} from 'regan';
import {Module1} from './module1.tsx';
import {Complex} from './complex.tsx';

const App = () => {
  return (
    <ErrorLogger>
      <Module1 />
      <Complex id='component' />
    </ErrorLogger>
  );
};

render(document.getElementById('app')!, <App />);
