import {createSignal, For} from 'solid-js';

export function makeApp(count) {
  const signals = Array.from({length: count}, (_, i) => createSignal(`строка ${i}`));

  const App = () => (
    <div id="root">
      {signals.map(([value]) => (
        <div class="row">
          <span class="cell">{value()}</span>
          <span class="cell">хвост</span>
        </div>
      ))}
    </div>
  );

  return {App, signals};
}
