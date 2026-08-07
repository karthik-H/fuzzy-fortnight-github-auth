import { H3Error } from 'h3';

export function apiFail(error: unknown, catchAllMessage?: string) {
  if (error instanceof H3Error && error.statusCode !== 500) {
    console.warn(
      `API Error [${error.statusCode}]: ${error.message || catchAllMessage}`,
    );
    return error;
  }

  const message = catchAllMessage ?? 'An unexpected error occur';
  console.error(`API Fatal Error: ${message}`, error);

  return createError({
    statusCode: 500,
    statusMessage: message,
  });
}
