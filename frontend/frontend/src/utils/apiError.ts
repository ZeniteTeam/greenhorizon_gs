import { isAxiosError } from 'axios';

interface ErrorBody {
  message?: unknown;
  detail?: unknown;
}

/** User-facing message sent by the backend (Spring `message` or FastAPI `detail`), or the fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError<ErrorBody>(error)) return fallback;
  const body = error.response?.data;
  const message = body?.message ?? body?.detail;
  return typeof message === 'string' && message.trim() !== '' ? message : fallback;
}
