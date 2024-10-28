import {SegmentComponent} from '../segments/component.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export class HNodeComponent extends HNodeBase {
  segmentComponentSure: SegmentComponent;
  constructor(
    props: PropsHNode,
    {
      segmentComponent,
    }: {
      segmentComponent: SegmentComponent;
    }
  ) {
    super(props);
    this.segmentComponentSure = segmentComponent;
  }
}
