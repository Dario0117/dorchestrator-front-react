export function normalizeFieldErrors(errors: unknown[]) {
  const messages: string[] = [];
  for (const error of errors) {
    if (typeof error === 'string') {
      messages.push(error);
    } else if (Array.isArray(error)) {
      messages.push(...error.filter((e): e is string => typeof e === 'string'));
    } else if (
      error !== null &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      messages.push((error as { message: string }).message);
    } else {
      messages.push('Invalid input');
    }
  }
  return messages;
}
