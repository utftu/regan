import {Atom, selectBase} from 'strangelove';
import {Mount} from '../../types.ts';
import {Child} from '../node.ts';
import {getRoot} from '../../root/root.ts';

type State = {
  mounts: Mount[];
  atoms: (Atom | Promise<Atom>)[];
};

type PropsCtx<TProps> = {
  props: TProps;
  state: State;
  children: Child[];
};

export class Ctx<TProps extends Record<any, any>> {
  state: State;
  props: TProps;
  children: Child[];

  constructor({props, state, children}: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
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

    // if (!(atom instanceof Promise)) {
    //   this.state.atoms.push(atom);
    //   // this.state.mounts.push(() => atom.relations.parents.clear());
    //   return atom as any;
    // }

    // return atom.then((atom) => {
    //   this.state.atoms.push(atom);
    //   this.state.mounts.push(() => atom.relations.parents.clear());
    //   return atom;
    // }) as any;
  }
}
