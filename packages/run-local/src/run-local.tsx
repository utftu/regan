import {atom} from 'strangelove';
import {ErrorLogger, FC, render} from 'regan';

const App = () => {
  return (
    <ErrorLogger>
      <Component />
    </ErrorLogger>
  );
};

const Component: FC = () => {
  const name = atom('Aleksey');

  setTimeout(() => {
    name.set('Ivan');
  }, 1000);

  return (
    <div>
      <div>
        Your name:{' '}
        <input value={atom} input={(event) => name.set(event?.target.value)} />
      </div>
      <div>My name is {name}</div>
    </div>
  );
};

render(document.getElementById('app')!, <App />);
