import {ContextEnt} from '../context/context.tsx';
import {
  GlobalCtx,
  GlobalCtxBoth,
  GlobalCtxServer,
} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {PathSegment as PathSegment} from './jsx-path/jsx-path.ts';

export class SegmentEnt {
  pathSegment: PathSegment;
  jsxNode: JsxNode;
  parentSegmentEnt: SegmentEnt | undefined;
  contextEnt: ContextEnt | undefined;
  hNode?: HNode;
  globalCtx: GlobalCtxBoth;

  constructor({
    jsxSegmentName,
    parentSegmentEnt,
    jsxNode,
    contextEnt: parentContextEnt,
    globalCtx,
  }: {
    jsxSegmentName: string;
    parentSegmentEnt: SegmentEnt | undefined;
    jsxNode: JsxNode;
    contextEnt: ContextEnt | undefined;
    globalCtx: GlobalCtxBoth;
  }) {
    this.pathSegment = new PathSegment({name: jsxSegmentName, systemEnt: this});
    this.parentSegmentEnt = parentSegmentEnt;
    this.jsxNode = jsxNode;
    this.contextEnt = parentContextEnt;
    this.globalCtx = globalCtx;
  }
}
