import {JsxNode} from '../../node/node.ts';
import {Unmount} from '../../types.ts';
import {JsxSegment} from './jsx-path/jsx-path.ts';

export class SegmentEnt {
  jsxSegment: JsxSegment;
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
    this.jsxSegment = new JsxSegment({name: jsxSegmentName, systemEnt: this});
    this.parentSystemEnt = parentSystemEnt;
    this.unmounts = unmounts;
    this.jsxNode = jsxNode;
  }
}
