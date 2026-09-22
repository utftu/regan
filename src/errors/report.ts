import type {ErrorRegan} from './errors.ts';

// Ошибку, которую никто не перехватил, показываем так же, как показал бы её
// непойманный throw: событие error в браузере, консоль где угодно ещё.
export const reportUncaught = (error: unknown) => {
  const path = (error as ErrorRegan | undefined)?.path;

  // Печатаем отдельной строкой, а не внутри message: браузер покажет message
  // как есть, а чужую строку ошибки переписывать нельзя.
  if (typeof path === 'string') {
    console.error(`regan: место ошибки: ${path}`);
  }

  if (typeof reportError === 'function') {
    reportError(error);
    return;
  }

  console.error(error);
};
