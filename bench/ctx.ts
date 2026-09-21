import {getCount} from './env.ts';

// Чего стоят поля-стрелки на экземпляр против методов прототипа.
//
// Осторожно с выводами: под bun этот микробенчмарк показывает разницу в
// десятки раз, под node после разогрева JIT — никакой. А на реальном
// монтировании 2000 строк (bench.ts) разницы нет ни там, ни там: создание Ctx
// теряется на фоне остальной работы. Поэтому Ctx оставлен со стрелками —
// они позволяют (props, {mount}) => ...
const count = getCount(100000);

class Arrows {
  a: number;

  constructor(a: number) {
    this.a = a;
  }

  mount = (fn: (a: number) => any) => fn(this.a);
  unmount = (fn: (a: number) => any) => fn(this.a);
  getJsxPath = () => this.a;
  getId = () => this.a;
  getContext = (context: any) => context;
}

class Methods {
  a: number;

  constructor(a: number) {
    this.a = a;
  }

  mount(fn: (a: number) => any) {
    return fn(this.a);
  }
  unmount(fn: (a: number) => any) {
    return fn(this.a);
  }
  getJsxPath() {
    return this.a;
  }
  getId() {
    return this.a;
  }
  getContext(context: any) {
    return context;
  }
}

const measureCreate = (name: string, Cls: typeof Arrows | typeof Methods) => {
  for (let i = 0; i < count; i++) {
    new Cls(i);
  }

  const store: any[] = [];
  const start = performance.now();

  for (let i = 0; i < count; i++) {
    store.push(new Cls(i));
  }

  const time = performance.now() - start;

  console.log(
    `${name.padEnd(10)} ${time.toFixed(2).padStart(8)} мс   ${((time * 1000) / count).toFixed(3)} мкс/шт`,
  );

  return store.length;
};

console.log(`N=${count} экземпляров`);

for (let run = 0; run < 3; run++) {
  measureCreate('стрелки', Arrows);
  measureCreate('методы', Methods);
  console.log('--');
}
