import {atom, select} from 'strangelove';
import {AtomWrapper, ErrorLogger, FC, render} from 'regan';

const App = () => {
  return (
    <ErrorLogger>
      <Component id='component' />
    </ErrorLogger>
  );
};

const AtomInner: FC = (props, {getJsxPath}) => {
  console.log(getJsxPath());
};

const Component: FC = (props, {mount, getId}) => {
  const name = atom('Aleksey');

  const id = getId() + '_wrapper';

  mount(() => {
    const div = document.getElementById(id)!;
  });

  const count = atom(0);

  setTimeout(() => {
    name.set('Ivan');
  }, 1000);

  return (
    <div id={getId() + '_wrapper'}>
      <div>error is {{}}</div>
      <div
        click={() => {
          count.set(count.get() + 1);
        }}
        title='uuuuuupdate'
      >
        update
      </div>
      <div>
        Your name:{' '}
        <input
          value={atom}
          input={(event) => {
            name.set(event.target.value);
          }}
        />
        <AtomWrapper
          atom={select((get) => {
            get(count);
            return <AtomInner />;
          })}
        ></AtomWrapper>
      </div>
      <div>My name is {name}</div>
    </div>
  );
};

render(document.getElementById('app')!, <App />);
