import {GlobalCtxServer} from '../ctx/global.ts';
import {StageProps} from '../types.ts';

export type StringifyProps = StageProps<GlobalCtxServer> & {
  // предыдущий ребёнок был текстом — значит между ними нужен разделитель
  lastText: boolean;
};

export type StringifyResult = {
  text: string;
  lastText: boolean;
};
