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
    const statusPrefix = error.response?.status ? `[HTTP ${error.response.status}] ` : '';
    const data = error.response?.data;
    if (data) {
      if (data.detail) return `${statusPrefix}${data.detail}`;
      if (data.message) return `${statusPrefix}${data.message}`;
      if (data.title) return `${statusPrefix}${data.title}`;
      if (data.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey && Array.isArray(data.errors[firstKey])) {
          return `${statusPrefix}${firstKey}: ${data.errors[firstKey][0]}`;
        }
      }
    }
    return statusPrefix ? `${statusPrefix}${fallbackMessage}` : fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
