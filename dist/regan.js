var T = Object.defineProperty;
var A = (e, t, s) => t in e ? T(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var i = (e, t, s) => (A(e, typeof t != "symbol" ? t + "" : t, s), s);
class g {
  constructor({
    // window,
    // stage: status,
    data: t = {},
    root: s,
    mode: n
  }) {
    // window: Window;
    // stage: Stage;
    i(this, "data");
    i(this, "root");
    i(this, "mode");
    this.data = t, this.root = s, this.mode = n;
  }
}
const m = (e) => {
  e.mount(), e.children.forEach((t) => m(t));
}, v = (e) => {
  e.unmount(), e.children.forEach((t) => v(t));
};
class E {
  constructor({
    getInitElemPointer: t,
    window: s
  }) {
    i(this, "getInitElemPointer");
    i(this, "window");
    this.getInitElemPointer = t, this.window = s;
  }
}
class u {
  constructor() {
    i(this, "parents", /* @__PURE__ */ new Set());
    i(this, "children", /* @__PURE__ */ new Set());
  }
  static new() {
    return new u();
  }
}
class x {
  constructor() {
    i(this, "listeners", []);
  }
  static new() {
    return new x();
  }
  subscribe(t) {
    return this.listeners.push(t), () => this.unsubscribe(t);
  }
  unsubscribe(t) {
    this.listeners = this.listeners.filter((s) => t !== s);
  }
  trigger(t) {
    this.listeners.forEach((s) => s(t));
  }
}
const P = () => !0;
class C {
  constructor(t, s = { checkPrev: !0 }) {
    i(this, "value");
    i(this, "checkPrev", !0);
    this.value = t, this.checkPrev = s.checkPrev ?? this.checkPrev;
  }
  static new(t, s) {
    return new C(t, s);
  }
  setData(t) {
    this.value = t;
  }
  get() {
    return this.value;
  }
  set(t) {
    return this.checkPrev && this.value === t ? !1 : (this.setData(t), !0);
  }
}
function b(e, t) {
  e.relations.children.add(t), t.relations.parents.add(e);
}
function y(e, t) {
  e.relations.children.delete(t), t.relations.parents.delete(e);
}
class k {
  constructor({ exec: t = P, root: s, value: n }) {
    i(this, "transaction");
    i(this, "value");
    i(this, "root");
    i(this, "exec");
    i(this, "listeners", new x());
    i(this, "relations", new u());
    this.exec = t, this.root = s, this.value = C.new(n), this.relations = u.new();
  }
  static new(t) {
    return new k(t);
  }
  static connect(t, s) {
    b(t, s);
  }
  static disconnect(t, s) {
    y(t, s);
  }
  update({ data: t } = { data: {} }) {
    return this.root.update(this, { data: t });
  }
  get() {
    return this.value.get();
  }
  async set(t) {
    if (!this.value.set(t))
      return !1;
    const { promise: s } = this.update({ data: null });
    return await s, !0;
  }
}
function O(e) {
  for (const t of e.relations.parents)
    y(t, e);
  e.transaction = {};
}
class I {
  constructor(t) {
    i(this, "links", /* @__PURE__ */ new Map());
    i(this, "root");
    this.root = t;
  }
  create(t) {
    const s = new k({
      root: t.root,
      exec: async () => {
        const n = t.get();
        return await this.root.addTx(/* @__PURE__ */ new Map([[t, n]])), !0;
      }
    });
    b(t, s), this.links.set(t, {
      execs: [],
      subsribeAtom: s
    });
  }
  delete(t) {
    O(this.links.get(t).subsribeAtom), this.links.delete(t);
  }
  add(t, s) {
    this.links.has(t) || this.create(t), this.links.get(t).execs.push(s);
  }
  get(t) {
    return this.links.get(t);
  }
  check(t) {
    return this.links.has(t);
  }
  remove(t, s) {
    if (!this.links.has(t))
      return;
    const n = this.links.get(t).execs.filter((r) => s !== r);
    n.length === 0 ? this.delete(t) : this.links.get(t).execs = n;
  }
}
function M() {
  let e, t;
  return [new Promise((s, n) => {
    e = s, t = n;
  }), { resolve: e, reject: t }];
}
class D {
  constructor() {
    i(this, "shards", []);
    i(this, "omittedShards", []);
  }
}
class R {
  constructor(t, s) {
    i(this, "tx");
    i(this, "execConfig");
    this.tx = t, t.shards.push(this), s.shards.push(this), this.execConfig = s;
  }
}
const F = 10;
class j {
  constructor(t, s) {
    i(this, "shards", []);
    i(this, "root");
    i(this, "changes");
    i(this, "promise");
    i(this, "promiseControls");
    // init => running => finished => closed
    // init => omitted => closed
    i(this, "status", "init");
    this.changes = t, this.root = s;
    const [n, r] = M();
    this.promise = n, this.promiseControls = r;
    for (const o of t.keys())
      this.root.atoms.has(o) || this.root.atoms.set(o, {
        shards: [],
        omittedShards: []
      }), new R(this, this.root.atoms.get(o));
  }
  checkOmmit() {
    for (const t of this.shards) {
      if (t.execConfig.omittedShards.length > F)
        return !1;
      const s = t.execConfig.shards, n = s.indexOf(t);
      if (s[n + 1] === void 0)
        return !1;
    }
    return !0;
  }
  omit() {
    this.status = "omitted";
    const t = [];
    for (const s of this.shards) {
      const n = s.execConfig.shards, r = n.indexOf(s);
      t.push(r), n.splice(r, 1), s.execConfig.omittedShards.push(s);
    }
    for (let s = 0; s < this.shards.length; s++) {
      const o = this.shards[s].execConfig.shards[t[s]];
      o && o.tx.root.handleTx(o.tx);
    }
  }
  checkExec() {
    for (const t of this.shards)
      if (t.execConfig.shards[0] !== t)
        return !1;
    return !0;
  }
  async exec() {
    this.status = "running";
    const t = [];
    for (const s of this.changes) {
      const [n, r] = s;
      if (!this.root.links.check(n))
        continue;
      this.root.links.get(n).execs.forEach((a) => {
        t.push(a(r));
      });
    }
    await Promise.all(t), this.finish();
  }
  finish() {
    this.status = "finished", this.shards.forEach((t) => {
      t.execConfig.shards.splice(0, 1);
    }), this.promiseControls.resolve(), this.shards.forEach((t) => {
      t.execConfig.omittedShards.forEach((n) => {
        n.tx.finishOmitted();
      });
      const s = t.execConfig.shards;
      s.length > 0 && this.root.handleTx(s[0].tx);
    }), this.status = "closed";
  }
  finishOmitted() {
    this.status = "closed", this.shards.forEach((t) => {
      const n = t.execConfig.omittedShards, r = n.indexOf(t);
      n.splice(r, 1);
    });
  }
}
class p {
  constructor() {
    // planner = new Planner();
    i(this, "links");
    i(this, "atoms", /* @__PURE__ */ new Map());
    this.links = new I(this);
  }
  // not check prev
  handleTx(t) {
    if (t.status !== "running" && t.status !== "omitted" && t.status !== "closed" && t.status !== "finished") {
      if (t.status === "init" && t.checkOmmit()) {
        t.omit();
        return;
      }
      if (t.status === "init" && t.checkExec()) {
        t.exec();
        return;
      }
    }
  }
  addTx(t) {
    const s = new j(t, this);
    return queueMicrotask(() => {
      this.handleTx(s);
    }), s.promise;
  }
  addExec(t, s) {
    this.links.add(t, s), this.atoms.has(t) || this.atoms.set(t, new D());
  }
  removeExec(t, s) {
    this.links.remove(t, s), this.links.check(t) || this.atoms.delete(t);
  }
  replaceExec(t, s, n) {
    if (!this.links.check(t))
      return;
    const r = this.links.get(t).execs, o = r.indexOf(s);
    o !== -1 && (r[o] = n);
  }
}
class S {
  constructor() {
    i(this, "atoms", /* @__PURE__ */ new Map());
  }
  parse(t) {
    return this.atoms.has(t) ? this.atoms.get(t) : (this.atoms.set(t, t.get()), t.relations.children.forEach((s) => this.parse(s)), t.relations.parents.forEach((s) => this.parse(s)), t.get());
  }
}
const L = ({
  parent: e,
  prev: t = void 0,
  elements: s
}) => {
  if (!t) {
    e.prepend(...s);
    return;
  }
  t.after(...s);
}, W = async ({
  node: e,
  window: t = window,
  getElemPointer: s,
  parentHNode: n,
  data: r,
  jsxSegmentStr: o = "",
  parentCtx: a
}) => {
  const h = [], { hNode: c, connectElements: f } = await e.render({
    parentHNode: n,
    jsxSegmentStr: o,
    parentCtx: a,
    globalCtx: (n == null ? void 0 : n.globalCtx) ?? new g({
      data: r,
      mode: "client",
      root: new p()
    }),
    hNodeCtx: (n == null ? void 0 : n.hNodeCtx) ?? new E({
      window: t,
      getInitElemPointer: s
    }),
    renderCtx: {
      snapshot: new S(),
      changedAtoms: h
    }
  });
  return {
    hNode: c,
    unmount: () => {
      v(c);
    },
    mount: () => {
      n && n.addChildren([c]);
      const { parent: w, prev: d } = s(), l = f();
      L({ parent: w, prev: d, elements: l }), m(c);
    }
  };
}, U = async (e, t, s = { window }) => {
  const { mount: n } = await W({
    node: t,
    getElemPointer: () => ({
      parent: e
    }),
    window: s.window
  });
  n();
}, q = (e, t) => t ? Array.from(e.children).indexOf(t) : 0;
async function G({
  getElementPointer: e,
  node: t,
  parentHNode: s,
  window: n = window,
  data: r = {},
  parentCtx: o
}) {
  const a = [], h = (s == null ? void 0 : s.globalCtx) ?? new g({
    data: r,
    mode: "client",
    root: new p()
  }), { parent: c, prev: f } = e(), { hNode: w } = await t.hydrate({
    jsxSegmentStr: "",
    dom: { parent: c, position: q(c, f) },
    parentHNode: s,
    globalCtx: h,
    hNodeCtx: (s == null ? void 0 : s.hNodeCtx) ?? new E({
      window: n,
      getInitElemPointer: e
    }),
    hCtx: {
      snapshot: new S(),
      changedAtoms: a
    }
  });
  h.root.addTx(
    a.reduce((d, l) => (d.set(l, l.get()), d), /* @__PURE__ */ new Map())
  ), m(w);
}
const V = (e, t, s = { window }) => G({
  getElementPointer() {
    return {
      parent: e
    };
  },
  window: s.window,
  node: t
});
async function z(e) {
  const t = e.getReader();
  let s = "";
  for (; ; ) {
    const { done: n, value: r } = await t.read();
    if (n)
      break;
    s += r;
  }
  return s;
}
const B = async (e) => await e.getStringStream({
  jsxSegmentStr: "",
  globalCtx: new g({
    mode: "server",
    data: {},
    root: new p()
  }),
  stringContext: {
    snapshot: new S()
  }
});
async function X(e) {
  const t = await B(e);
  return await z(t);
}
const J = Symbol("NEED_AWAIT"), K = (e, { systemProps: t, children: s }) => (t.needAwait = !0, s);
K[J] = !0;
export {
  K as Fragment,
  X as getString,
  B as getStringStream,
  V as hydrate,
  G as hydrateRaw,
  W as rednerRaw,
  U as render
};
