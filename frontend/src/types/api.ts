export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type ApiListResponse<T> = {
  message: string;
  count: number;
  data: T[];
};

export type ApiError = {
  message: string;
  errors?: string[];
};
