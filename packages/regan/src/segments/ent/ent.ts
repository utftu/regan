import {JsxNode} from '../../node/node.ts';
import {Unmount} from '../../types.ts';
import {PathSegment as PathSegment} from './jsx-path/jsx-path.ts';

export class SegmentEnt {
  pathSegment: PathSegment;
  jsxNode: JsxNode;
  parentSystemEnt?: SegmentEnt;
  unmounts: Unmount[];
  constructor({
    jsxSegmentName,
    parentSystemEnt,
    unmounts = [],
    jsxNode,
  }: {
    jsxSegmentName: string;
    parentSystemEnt?: SegmentEnt;
    unmounts: Unmount[];
    jsxNode: JsxNode;
  }) {
    this.pathSegment = new PathSegment({name: jsxSegmentName, systemEnt: this});
    this.parentSystemEnt = parentSystemEnt;
    this.unmounts = unmounts;
    this.jsxNode = jsxNode;
  }
}
