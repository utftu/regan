import {FC, JsxNode, render} from 'regan';
// import {JsxNode as JsxNode2} from '../../regan/src/regan.ts';

const a = <div>2323</div>;

// const aa = null as any as JsxNode;
// const bb = (<div>123</div>) as JSX.Element;
// const dd: JsxNode<any, any> = bb;

const App: FC = (_, {createAtom, select}) => {
  // const state = createAtom('hello');
  // const savedValue = createAtom('');

  const name = createAtom('Aleksey');
  // const family = createAtom('Malyuta');

  // const MyHello = async () => {
  //   // await fetch('234');
  //   return 'sdsdssdsdsdsdsds';
  // };

  // MyHello.returnLength = 'sdsdssdsdsdsdsds';
  // const atom = createAtom(MyHello);

  setTimeout(() => {
    name.set('Ivan');
  }, 1000);

  return <div>My name is {name}</div>;

  // return (
  //   <div>
  //     <div>emp</div>
  //     <div>Value is {state}</div>
  //     <div>
  //       New value is{' '}
  //       <input
  //         value={savedValue}
  //         input={(event) => {
  //           savedValue.set(event.target!.value);
  //         }}
  //       ></input>
  //     </div>
  //     <div
  //       click={() => {
  //         state.set(savedValue.get());
  //       }}
  //     >
  //       Save
  //     </div>
  //   </div>
  // );
};
// // // const b: JsxNode = null as any as JsxNode2;

render(document.getElementById('app')!, <App />);
