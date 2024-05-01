export const formatJsxValue = async (value: any) => {
  const valueResult = typeof value === 'function' ? value() : value;
  const awaitedValue = await valueResult;
  return awaitedValue;
};
