import {Atom, selectBase} from 'strangelove';
import {Child, Mount} from '../types.ts';
import {getRoot} from '../atoms/atoms.ts';

type State = {
  mounts: Mount[];
  atoms: (Atom | Promise<Atom>)[];
};

type PropsCtx<TProps> = {
  props: TProps;
  state: State;
  children: Child[];
  jsxPath: string;
};

export class Ctx<TProps extends Record<any, any> = any> {
  state: State;
  props: TProps;
  children: Child[];
  jsxPath: string;

  constructor({props, state, children, jsxPath}: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
    this.jsxPath = jsxPath;
  }

  mount(fn: Mount) {
    this.state.mounts.push(fn);
  }

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
}
