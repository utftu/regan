type Stage = 'string' | 'hydrate' | 'render';

type Data = Record<any, any>;

export class GlobalCtx {
  window: Window;
  stage: Stage;
  data: Data;
  constructor({
    window,
    stage: status,
    data = {},
  }: {
    window: Window;
    stage: Stage;
    data?: Data;
  }) {
    this.window = window;
    this.stage = status;
    this.data = data;
  }
}
