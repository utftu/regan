import {type FC} from 'regan';
import {atom, select} from 'strangelove';

export const ReganComponent: FC = () => {
  const name = atom('deniz');

  return (
    <div>
      <div>name is {name}</div>
      <div>
        PARENT
        <div>hello from parent</div>
        <div>
          <div>name is {name}</div>

          <input
            value={atom}
            input={(event) => {
              console.log('input', event.target.value);
              name.set(event.target.value);
            }}
          />
        </div>
      </div>

      <ReganComponentChild />
    </div>
  );
};

const ReganComponentChild: FC = () => {
  const name = atom('aleksey');
  return (
    <div>
      CHILD
      <div>hello from child</div>
      <div>
        <div>name is {name}</div>

        <input value={atom} input={(event) => name.set(event.target.value)} />
      </div>
    </div>
  );
};
