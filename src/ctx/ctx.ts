import {Atom, selectBase} from 'strangelove';
import {Child, Mount, SystemProps, Unmount} from '../types.ts';
import {getRoot} from '../atoms/atoms.ts';
import {
  JsxSegment,
  getHashFromString,
  getJsxPath,
} from '../jsx-path/jsx-path.ts';
import {HNode} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNodeComponent} from '../node/component/component.ts';

type State = {
  mounts: Mount[];
  unmounts: Unmount[];
  atoms: (Atom | Promise<Atom>)[];
};

export type Stage = 'render' | 'hydrate' | 'string';

type PropsCtx<TProps> = {
  props: TProps;
  systemProps: SystemProps;
  state: State;
  children: Child[];
  jsxSegment: JsxSegment;
  hNode?: HNode;
  globalCtx: GlobalCtx;
  stage: Stage;
  parentCtx?: Ctx;
  jsxNodeComponent: JsxNodeComponent;
};

export class Ctx<TProps extends Record<any, any> = any> {
  state: State;
  props: TProps;
  systemProps: SystemProps;
  children: Child[];
  jsxSegment: JsxSegment;
  hNode?: HNode;
  globalCtx: GlobalCtx;
  stage: Stage;
  parentCtx?: Ctx;
  jsxNodeComponent: JsxNodeComponent;
  ctx: Ctx;

  constructor({
    props,
    state,
    children,
    jsxSegment,
    hNode,
    globalCtx,
    stage,
    parentCtx,
    systemProps,
    jsxNodeComponent,
  }: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
    this.jsxSegment = jsxSegment;
    this.hNode = hNode;
    this.globalCtx = globalCtx;
    this.stage = stage;
    this.parentCtx = parentCtx;
    this.systemProps = systemProps;
    this.jsxNodeComponent = jsxNodeComponent;
    this.ctx = this;
  }

  mount = (fn: Mount) => {
    this.state.mounts.push(fn);
  };

  unmount = (fn: Unmount) => {
    this.state.unmounts.push(fn);
  };

  createAtom = <TValue>(value: TValue) => {
    const atom = Atom.new({
      value: value,
      root: getRoot(),
    });

    this.state.atoms.push(atom);

    return atom;
  };

  select = <TCb extends (...args: any) => any>(
    cb: TCb
  ): ReturnType<TCb> extends Promise<infer TResult>
    ? Promise<Atom<TResult>>
    : Atom<ReturnType<TCb>> => {
    const atom = selectBase(cb, {
      root: getRoot(),
      onAtomCreate: () => {},
    });

    this.state.atoms.push(atom);

    return atom;
  };

  getJsxPath = () => {
    return getJsxPath(this.jsxSegment);
  };

  getId = () => {
    const jsxPath = this.getJsxPath();
    return getHashFromString(jsxPath);
  };
}
