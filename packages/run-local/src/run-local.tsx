import {render} from 'regan';

render(
  document.getElementById('app'),
  <div
    click={() => {
      console.log('hello');
    }}
  >
    hello
  </div>
);
