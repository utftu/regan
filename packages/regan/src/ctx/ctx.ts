import {Child, DomPointer, SystemProps} from '../types.ts';
import {HNode, Mount, Unmount} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Context, ContextEnt, getContextValue} from '../context/context.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {HNodeComponent} from '../h-node/component.ts';

type State = {
  mounts: Mount[];
  unmounts: Unmount[];
};

export type Stage = 'render' | 'hydrate' | 'string';

type Client = {
  hNode: HNode;
  parentDomPointer: DomPointer;
};

type SystemPropsCtx = SystemProps & {
  rawHNode?: HNode;
};

type PropsCtx<TProps> = {
  props: TProps;
  systemProps: SystemPropsCtx;
  state: State;
  children: Child[];
  globalCtx: GlobalCtx;
  stage: Stage;
  segmentEnt: SegmentEnt;
  client?: Client;
  parentContextEnt: ContextEnt | undefined;
};

// args to run FC
export class Ctx<TProps extends Record<any, any> = Record<any, any>> {
  state: State;
  props: TProps;
  systemProps: SystemPropsCtx;
  children: Child[];
  segmentEnt: SegmentEnt;
  globalCtx: GlobalCtx;
  stage: Stage;
  ctx: Ctx;
  client?: Client;
  parentContextEnt?: ContextEnt;

  constructor({
    props,
    state,
    children,
    globalCtx,
    stage,
    systemProps,
    client,
    segmentEnt,
    parentContextEnt,
  }: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
    this.globalCtx = globalCtx;
    this.stage = stage;
    this.systemProps = systemProps;
    this.client = client;
    this.segmentEnt = segmentEnt;
    this.parentContextEnt = parentContextEnt;

    this.ctx = this;
  }

  mount = (fn: Mount<HNodeComponent>) => {
    const mount: Mount<HNodeComponent> = (
      ...args: Parameters<Mount<HNodeComponent>>
    ) => {
      const hNode = args[0];
      const unmount = fn(...args);

      if (typeof unmount === 'function') {
        hNode.unmounts.push(unmount);
      }
    };

    this.state.mounts.push(mount);
  };

  unmount = (fn: Unmount) => {
    this.state.unmounts.push(fn);
  };

  getJsxPath = () => {
    return this.segmentEnt.pathSegment.getJsxPath();
  };

  getId = () => {
    return this.segmentEnt.pathSegment.getId();
  };

  getContext = (context: Context) => {
    return getContextValue(context, this.parentContextEnt);
  };
}
