export function parseJsonObject<TInput, TOutput>(
  inputObject: TInput,
  validator: (input: unknown) => input is TOutput,
): TOutput | null {
  if (
    typeof inputObject !== 'object' ||
    inputObject === null ||
    Array.isArray(inputObject)
  ) {
    return null;
  }

  if (!validator(inputObject)) {
    return null;
  }

  return inputObject as TOutput;
}
