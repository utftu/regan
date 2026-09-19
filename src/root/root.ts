import {Atom} from 'strangelove';
import {AnyFunc} from '../types.ts';

// type CallEnt = {
//   listeners: AnyFunc[];
//   planned: boolean;
//   timerId?: ReturnType<typeof setTimeout>;
// };

// class DelayedCalls {
//   store: Map<Atom, CallEnt> = new Map();

//   add(atom: Atom, listener: AnyFunc) {
//     if (!this.store.has(atom)) {
//       this.store.set(atom, {listeners: [listener], planned: false});
//       return;
//     }

//     this.store.get(atom)!.listeners.push(listener);
//   }

//   private delete(atom: Atom) {
//     const callEnt = this.store.get(atom)!;
//     if (callEnt.planned) {
//       clearTimeout(callEnt.timerId);
//     }
//     this.store.delete(atom);
//   }

//   remove(atom: Atom, listener: AnyFunc) {
//     const callEnt = this.store.get(atom)!;

//     if (callEnt.listeners.length === 1) {
//       this.delete(atom);
//       return;
//     }

//     callEnt.listeners = callEnt.listeners.filter((l) => l !== listener);
//   }

//   trigger(atom: Atom) {
//     const callEnt = this.store.get(atom)!;
//     if (callEnt.planned) {
//       return;
//     }

//     callEnt.planned = true;

//     callEnt.timerId = setTimeout(() => {
//       callEnt.listeners.forEach((listener) => listener());
//     }, 0);
//   }
// }

export class Root {
  // queue = new DelayedCalls();
}
