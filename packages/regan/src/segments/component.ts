import {Ctx} from '../ctx/ctx.ts';
import {Unmount} from '../types.ts';

export class SegmentComponent {
  parentSysyemComponent?: SegmentComponent;
  children: SegmentComponent[];
  unmounts: Unmount[];
  ctx: Ctx;

  constructor({
    parentSysyemComponent,
    children = [],
    unmounts,
    ctx,
  }: {
    parentSysyemComponent?: SegmentComponent;
    children: SegmentComponent[];
    unmounts: Unmount[];
    ctx: Ctx;
  }) {
    this.parentSysyemComponent = parentSysyemComponent;
    this.children = children;
    this.unmounts = unmounts;
    this.ctx = ctx;
  }
}
