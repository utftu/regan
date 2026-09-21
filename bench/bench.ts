import {flush, getCount, makeContainer, measure, wait} from './env.ts';
import {
  createReact,
  createRegan,
  createSolid,
  Framework,
} from './frameworks.ts';

const count = getCount(1000);

const frameworks: Framework[] = [
  await createRegan(count),
  await createReact(count),
  await createSolid(count),
];

const baseline = await measure(wait, 50);

for (const framework of frameworks) {
  // прогрев: первый монтаж всегда дороже из-за JIT
  const warm = makeContainer();
  await framework.updateAll(framework.mount(warm), 'прогрев');
  warm.remove();

  const mount = await measure(() => {
    const container = makeContainer();
    framework.mount(container);
    container.remove();
  }, 10);

  const container = makeContainer();
  const handle = framework.mount(container);

  const updateAll = await measure(
    (i) => framework.updateAll(handle, `все ${i}`),
    20,
  );
  const updateOne = await measure(
    (i) => framework.updateOne(handle, `один ${i}`),
    50,
  );

  container.remove();

  console.log(
    `${framework.name.padEnd(6)} | монтирование ${mount.toFixed(1).padStart(7)} мс` +
      ` | обновить все ${updateAll.toFixed(2).padStart(7)} мс` +
      ` | обновить один ${updateOne.toFixed(3).padStart(6)} мс`,
  );
}

console.log(`\nбаза setTimeout(0): ${baseline.toFixed(3)} мс`);

// контроль: обновление действительно доехало до DOM за микротаск
const container = makeContainer();
const atoms = frameworks[0].mount(container);
atoms[0].set('проверка');
await flush();
console.log(
  `контроль микротаска: "${container.querySelector('.row .cell')!.textContent}"`,
);
container.remove();
