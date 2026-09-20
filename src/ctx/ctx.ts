import {SingleChild, SystemProps} from '../types.ts';
import {Mount, MountUnmounFunc, Unmount} from '../h-node/h-node.ts';
import {AreaCtx, GlobalCtxBoth} from '../ctx/global.ts';
import {Context, ContextEnt, getContextValue} from '../context/context.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {HNodeComponent} from '../h-node/component.ts';

export class ComponentState {
  mounts: Mount[] = [];
  unmounts: Unmount[] = [];
}

export type Stage = 'render' | 'hydrate' | 'string';

type SystemPropsCtx = SystemProps & {};

type PropsCtx<TProps> = {
  props: TProps;
  systemProps: SystemPropsCtx;
  state: ComponentState;
  children: SingleChild[];
  globalCtx: GlobalCtxBoth;
  areaCtx: AreaCtx;
  stage: Stage;
  segmentEnt: SegmentEnt;
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
  contextEnt?: ContextEnt;
  areaCtx: AreaCtx;

  constructor({
    props,
    state,
    children,
    globalCtx,
    stage,
    systemProps,
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
    this.segmentEnt = segmentEnt;
    this.contextEnt = contextEnt;
    this.areaCtx = areaCtx;
  }

  mount = (fn: Mount<HNodeComponent>) => {
    // обёртка принимает любой HNode, потому что так объявлен список mounts,
    // но зовут её всегда с hNode того компонента, чей это ctx
    const mount: MountUnmounFunc = (hNode) => {
      const unmount = fn(hNode as HNodeComponent);

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
    return this.segmentEnt.getJsxPath();
  };

  getId = () => {
    return this.segmentEnt.getId();
  };

  getContext = (context: Context) => {
    return getContextValue(context, this.contextEnt);
  };
}
