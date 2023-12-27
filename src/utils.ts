export function addEventListenerStore({
  listener,
  name,
  elem,
  store,
}: {
  listener: EventListener;
  name: string;
  elem: HTMLElement;
  store: Record<any, any>;
}) {
  if (name in store) {
    elem.removeEventListener(name, store[name]);
  }

  elem.addEventListener(name, listener);
  store[name] = listener;
  return;
}
