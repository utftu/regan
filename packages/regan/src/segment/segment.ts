import {ContextEnt} from '../context/context.tsx';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {PathSegment as PathSegment} from './jsx-path/jsx-path.ts';

export class SegmentEnt {
  pathSegment: PathSegment;
  jsxNode: JsxNode;
  parentSegmentEnt: SegmentEnt | undefined;
  contextEnt: ContextEnt | undefined;

  constructor({
    jsxSegmentName,
    parentSegmentEnt,
    jsxNode,
    contextEnt: parentContextEnt,
  }: {
    jsxSegmentName: string;
    parentSegmentEnt: SegmentEnt | undefined;
    jsxNode: JsxNode;
    contextEnt: ContextEnt | undefined;
  }) {
    this.pathSegment = new PathSegment({name: jsxSegmentName, systemEnt: this});
    this.parentSegmentEnt = parentSegmentEnt;
    this.jsxNode = jsxNode;
    this.contextEnt = parentContextEnt;
  }
}
