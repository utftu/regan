type Status = 'string' | 'hydrate' | 'render';

type Data = Record<any, any>;

export class GlobalCtx {
  window: Window;
  status: Status;
  data: Data;
  constructor({
    window,
    status,
    data = {},
  }: {
    window: Window;
    status: Status;
    data?: Data;
  }) {
    this.window = window;
    this.status = status;
    this.data = data;
  }
}
