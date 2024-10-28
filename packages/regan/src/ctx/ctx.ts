import {Atom, selectBase} from 'strangelove';
import {
  Child,
  DomPointerElement,
  Mount,
  SystemProps,
  Unmount,
} from '../types.ts';
import {getRoot} from '../atoms/atoms.ts';
import {HNode, HNodeBase} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';

type State = {
  mounts: Mount[];
  unmounts: Unmount[];
  atoms: (Atom | Promise<Atom>)[];
};

export type Stage = 'render' | 'hydrate' | 'string';

type AnyProps = Record<any, any>;

type Client = {
  hNode: HNodeBase;
  parentDomPointer: DomPointerElement;
};

type PropsCtx<TProps> = {
  props: TProps;
  systemProps: SystemProps;
  state: State;
  children: Child[];
  hNode?: HNode;
  globalCtx: GlobalCtx;
  stage: Stage;
  segmentEnt: SegmentEnt;
  jsxNodeComponent: JsxNodeComponent;
  client?: Client;
  propsFromAncestors?: AnyProps;
};

// args to run FC
export class Ctx<
  TProps extends Record<any, any> = Record<any, any>,
  THNode extends HNode | undefined = HNode | undefined
> {
  state: State;
  props: TProps;
  systemProps: SystemProps;
  children: Child[];
  segmentEnt: SegmentEnt;
  hNode: THNode;
  globalCtx: GlobalCtx;
  stage: Stage;
  parentCtx?: Ctx;
  jsxNodeComponent: JsxNodeComponent;
  ctx: Ctx;
  client?: Client;
  propsToDescendants: AnyProps = {};
  propsFromAncestors: AnyProps;

  constructor({
    props,
    state,
    children,
    hNode,
    globalCtx,
    stage,
    systemProps,
    jsxNodeComponent,
    client,
    propsFromAncestors = {},
    segmentEnt,
  }: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
    // this.jsxSegment = jsxSegment;
    this.hNode = hNode as THNode;
    this.globalCtx = globalCtx;
    this.stage = stage;
    // this.parentCtx = parentCtx;
    this.systemProps = systemProps;
    this.jsxNodeComponent = jsxNodeComponent;
    this.client = client;
    this.propsFromAncestors = propsFromAncestors;
    this.segmentEnt = segmentEnt;

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
    return this.segmentEnt.jsxSegment.getJsxPath();
  };

  getId = () => {
    return this.segmentEnt.jsxSegment.getId();
  };
}
