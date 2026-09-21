// Чего стоят 5 полей-стрелок на экземпляр против методов прототипа.
const N = Number(process.argv[2] ?? 100000);

class Arrows {
  constructor(a) {
    this.a = a;
  }
  mount = (fn) => fn(this.a);
  unmount = (fn) => fn(this.a);
  getJsxPath = () => this.a;
  getId = () => this.a;
  getContext = (c) => c;
}

class Methods {
  constructor(a) {
    this.a = a;
  }
  mount(fn) {
    return fn(this.a);
  }
  unmount(fn) {
    return fn(this.a);
  }
  getJsxPath() {
    return this.a;
  }
  getId() {
    return this.a;
  }
  getContext(c) {
    return c;
  }
}

const measure = (name, Cls) => {
  // прогрев
  for (let i = 0; i < N; i++) new Cls(i);

  const start = performance.now();
  const store = [];
  for (let i = 0; i < N; i++) {
    store.push(new Cls(i));
  }
  const time = performance.now() - start;
  console.log(
    `${name.padEnd(10)} ${time.toFixed(2).padStart(8)} мс   ${((time * 1000) / N).toFixed(3)} мкс/шт`,
  );
  return store.length;
};

console.log(`N=${N} экземпляров`);
for (let run = 0; run < 3; run++) {
  measure('стрелки', Arrows);
  measure('методы', Methods);
  console.log('--');
}
