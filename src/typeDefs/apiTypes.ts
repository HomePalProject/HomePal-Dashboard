export interface ApiResponse<T> {
  success: boolean;
  status?: string;
  message?: string;
  data: T;
  errors?: string[] | null;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}
