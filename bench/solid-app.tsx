import {createSignal} from 'solid-js';

// Тот же список, что у regan и React. Компилируется babel-preset-solid
// в template() + cloneNode — без этого Solid не работает.
export function makeApp(count: number) {
  const signals = Array.from({length: count}, (_, i) =>
    createSignal(`строка ${i}`),
  );

  const App = () => (
    <div id='root'>
      {signals.map(([value]) => (
        <div class='row'>
          <span class='cell'>{value()}</span>
          <span class='cell'>хвост</span>
        </div>
      ))}
    </div>
  );

  return {App, signals};
}
