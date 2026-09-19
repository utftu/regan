import {Ref} from '../types.ts';

export function applyRef(
  ref: Ref | undefined,
  element: Element | undefined,
): void {
  if (ref === undefined) {
    return;
  }

  if (typeof ref === 'function') {
    ref(element);
    return;
  }

  ref.set(element);
}
