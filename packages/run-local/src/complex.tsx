import {AtomWrapper, FC} from 'regan/jsx-runtime';
import {createAtom, select} from 'strangelove';

const AtomInner: FC = (props, {getJsxPath}) => {
  console.log(getJsxPath());
};

export const Complex: FC = (props, {mount, getId}) => {
  const name = createAtom('Aleksey');
  const count = createAtom(0);

  setTimeout(() => {
    name.set('Ivan');
  }, 1000);

  return (
    <div>
      <div
        click={() => {
          count.set(count.get() + 1);
        }}
        title='update'
      >
        update
      </div>
      <div>
        Your name:{' '}
        <input
          value={name}
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
