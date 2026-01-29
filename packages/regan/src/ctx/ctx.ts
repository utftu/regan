import {SingleChild, DomPointer, SystemProps} from '../types.ts';
import {HNode, Mount, Unmount} from '../h-node/h-node.ts';
import {
  AreaCtx,
  GlobalCtx,
  GlobalCtxBoth,
  GlobalCtxServer,
} from '../global-ctx/global-ctx.ts';
import {Context, ContextEnt, getContextValue} from '../context/context.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';

export class ComponentState {
  mounts: Mount[] = [];
  unmounts: Unmount[] = [];
}

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
  state: ComponentState;
  children: SingleChild[];
  globalCtx: GlobalCtxBoth;
  areaCtx: AreaCtx;
  stage: Stage;
  segmentEnt: SegmentEnt;
  client?: Client;
  contextEnt: ContextEnt | undefined;
};

// args to run FC
export class Ctx<TProps extends Record<any, any> = Record<any, any>> {
  state: ComponentState;
  props: TProps;
  systemProps: SystemPropsCtx;
  children: SingleChild[];
  segmentEnt: SegmentEnt;
  globalCtx: GlobalCtxBoth;
  stage: Stage;
  ctx: Ctx;
  client?: Client;
  contextEnt?: ContextEnt;
  // system: {atomTracker?: AtomsTracker} = {};
  areaCtx: AreaCtx;

  constructor({
    props,
    state,
    children,
    globalCtx,
    stage,
    systemProps,
    client,
    segmentEnt,
    contextEnt,
    areaCtx,
  }: PropsCtx<TProps>) {
    this.state = state;
    this.props = props;
    this.children = children;
    this.globalCtx = globalCtx;
    this.stage = stage;
    this.systemProps = systemProps;
    this.client = client;
    this.segmentEnt = segmentEnt;
    this.contextEnt = contextEnt;
    this.areaCtx = areaCtx;
    // Intentional self-reference: allows `ctx` and `ctx.ctx` to be used interchangeably in FC(props, ctx).
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
    return getContextValue(context, this.contextEnt);
  };
}
