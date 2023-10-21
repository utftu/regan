import {describe, it} from 'vitest';
import {JSDOM} from 'jsdom';
import {redner} from './render/render.ts';

// @vitest-environment jsdom
describe('render', () => {
  it('a', async () => {
    const Component = () => {
      return <div>Component</div>;
    };

    const jsdom = new JSDOM();

    await redner(jsdom.window.document.body, <Component />, {
      window: jsdom.window,
    });

    console.log('-----', 'jsdom', jsdom.window.document.body.innerHTML);
  });
});
