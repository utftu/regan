import {type Atom, type ComponentCtx} from './src/types.ts';

type Props = {
  age: Atom<number>;
  promiseName: Atom<Promise<string>>;
};

async function A(ctx: ComponentCtx<Props>) {
  const {age, promiseName} = ctx.props;

  const name = await promiseName.get();

  ctx.mount(() => {
    ctx.select((get) => {
      if (get(ctx.props.age) > 18) {
        console.log('onMount if');
      } else {
        console.log('onMount else');
      }
    });
  });

  ctx.mount(() => {
    return () => {
      console.log('unsubscribe');
    };
  });

  const ageValid_selectCase = ctx.select((get) => {
    if (get(ctx.props.age) > 18) {
      console.log('selectCase if');
      return 'valid';
    } else {
      console.log('else');
      return 'not valid';
    }
  });

  return (
    <div>
      {/* select case */}
      <div>{ageValid_selectCase}</div>

      {/* show case */}
      <Show show={(get) => get(age) + 1 > 18}>You are over 18</Show>

      {/* func case */}
      {(get) => {
        if (get(ctx.props.age) > 18) {
          return <div>hello</div>;
        } else {
          return <div>world</div>;
        }
      }}

      <div>{name}</div>
    </div>
  );
}
