import {Atom, selectBase} from 'strangelove';
import {Mount} from '../../types.ts';
import {getRoot} from '../../regan.ts';

type State = {
  mounts: Mount[];
  atoms: Atom[];
};

type PropsCtx<TProps> = {
  props: TProps;
  state: State;
};

export class Ctx<TProps extends Record<any, any>> {
  private state: State;
  props: TProps;

  constructor({props, state}: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
  }

  mount(fn: Mount) {
    this.state.mounts.push(fn);
  }

  atom<TValue>(value: TValue) {
    const atom = Atom.new({
      value: value,
      root: getRoot(),
    });

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

    if (!(atom instanceof Promise)) {
      this.state.atoms.push(atom);
      this.state.mounts.push(() => atom.relations.parents.clear());
      return atom as any;
    }

    return atom.then((atom) => {
      this.state.atoms.push(atom);
      this.state.mounts.push(() => atom.relations.parents.clear());
      return atom;
    }) as any;
  }
}
