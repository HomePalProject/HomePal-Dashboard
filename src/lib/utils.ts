import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isAxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.'
): string {
  if (!error) return fallbackMessage;

  if (typeof window !== 'undefined' && !navigator.onLine) {
    return 'Network Error: Unable to connect to the server. Please check your internet connection.';
  }

  if (isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'Network Error: Unable to connect to the server. Please check your internet connection.';
    }
    return error.response?.data?.message || error.response?.data?.title || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
