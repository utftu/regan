import {defineClassName} from '../utils/check-parent.ts';
import {HNode} from './h-node.ts';

export class HNodeComponent extends HNode {}
defineClassName(HNodeComponent, 'hNodeComponent');
