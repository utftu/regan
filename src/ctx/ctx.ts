import {Atom, selectBase} from 'strangelove';
import {Child, Mount, Unmount} from '../types.ts';
import {getRoot} from '../atoms/atoms.ts';
import {
  JsxSegment,
  getHashFromString,
  getJsxPath,
} from '../jsx-path/jsx-path.ts';
import {HNode} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';

type State = {
  mounts: Mount[];
  unmounts: Unmount[];
  atoms: (Atom | Promise<Atom>)[];
};

type PropsCtx<TProps> = {
  props: TProps;
  state: State;
  children: Child[];
  jsxSegment: JsxSegment;
  hNode?: HNode;
  globalCtx: GlobalCtx;
};

export class Ctx<TProps extends Record<any, any> = any> {
  state: State;
  props: TProps;
  children: Child[];
  jsxSegment: JsxSegment;
  hNode?: HNode;
  globalCtx: GlobalCtx;

  constructor({
    props,
    state,
    children,
    jsxSegment,
    hNode,
    globalCtx,
  }: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
    this.jsxSegment = jsxSegment;
    this.hNode = hNode;
    this.globalCtx = globalCtx;

    // this.jsxPath = jsxPath;
  }

  // getStage() {
  //   return this.globalCtx.stage;
  // }

  // get status() {
  //   return this.globalCtx.stage;
  // }

  mount = (fn: Mount) => {
    this.state.mounts.push(fn);
  };

  unmount = (fn: Unmount) => {
    this.state.unmounts.push(fn);
  };

  atom<TValue>(value: TValue) {
    const atom = Atom.new({
      value: value,
      root: getRoot(),
    });

    this.state.atoms.push(atom);

    return atom;
  }

  select<TCb extends (...args: any) => any>(
    cb: TCb
  ): ReturnType<TCb> extends Promise<infer TResult>
    ? Promise<Atom<TResult>>
    : Atom<ReturnType<TCb>> {
    const atom = selectBase(cb, {
      root: getRoot(),
      onAtomCreate: () => {},
    });

    this.state.atoms.push(atom);

    return atom;
  }

  getJsxPath() {
    return getJsxPath(this.jsxSegment);
  }

  getId() {
    const jsxPath = this.getJsxPath();
    return getHashFromString(jsxPath);
  }
}
