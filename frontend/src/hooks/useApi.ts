import { useCallback, useMemo, useState } from "react";
import type { ApiError } from "../types/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiRequestError extends Error implements ApiError {
  errors?: string[];
  status?: number;

  constructor(
    message: string,
    options: { errors?: string[]; status?: number } = {},
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.errors = options.errors;
    this.status = options.status;
  }
}

export type ApiRequestOptions = {
  body?: unknown;
  headers?: HeadersInit;
  method?: HttpMethod;
  signal?: AbortSignal;
};

export type UseApiOptions = {
  baseUrl?: string;
  getAuthToken?: () => string | null | undefined;
};

export type RequestState = {
  error: ApiRequestError | null;
  isLoading: boolean;
};

const JSON_CONTENT_TYPE = "application/json";

function isApiErrorPayload(value: unknown): value is ApiError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as ApiError;

  return (
    "message" in payload &&
    typeof payload.message === "string" &&
    (!("errors" in payload) ||
      (Array.isArray(payload.errors) &&
        payload.errors.every((error) => typeof error === "string")))
  );
}

function normalizeUnknownError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError("Something went wrong. Please try again.");
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes(JSON_CONTENT_TYPE)) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

function buildHeaders(
  options: ApiRequestOptions,
  authToken?: string | null,
): Headers {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", JSON_CONTENT_TYPE);
  }

  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  return headers;
}

export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
  config: UseApiOptions = {},
): Promise<T> {
  const response = await fetch(`${config.baseUrl ?? ""}${url}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options, config.getAuthToken?.()),
    method: options.method ?? "GET",
    signal: options.signal,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (isApiErrorPayload(data)) {
      throw new ApiRequestError(data.message, {
        errors: data.errors,
        status: response.status,
      });
    }

    throw new ApiRequestError(response.statusText || "Request failed.", {
      status: response.status,
    });
  }

  return data as T;
}

export function useApi(options: UseApiOptions = {}) {
  const [state, setState] = useState<RequestState>({
    error: null,
    isLoading: false,
  });

  const request = useCallback(
    async <T>(url: string, requestOptions: ApiRequestOptions = {}) => {
      setState({ error: null, isLoading: true });

      try {
        const data = await apiRequest<T>(url, requestOptions, options);
        setState({ error: null, isLoading: false });
        return data;
      } catch (error) {
        const normalizedError = normalizeUnknownError(error);
        setState({ error: normalizedError, isLoading: false });
        throw normalizedError;
      }
    },
    [options],
  );

  const resetError = useCallback(() => {
    setState((currentState) => ({ ...currentState, error: null }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      delete: <T>(
        url: string,
        requestOptions?: Omit<ApiRequestOptions, "method">,
      ) => request<T>(url, { ...requestOptions, method: "DELETE" }),
      get: <T>(
        url: string,
        requestOptions?: Omit<ApiRequestOptions, "body" | "method">,
      ) => request<T>(url, { ...requestOptions, method: "GET" }),
      patch: <T>(
        url: string,
        body?: unknown,
        requestOptions?: Omit<ApiRequestOptions, "body" | "method">,
      ) => request<T>(url, { ...requestOptions, body, method: "PATCH" }),
      post: <T>(
        url: string,
        body?: unknown,
        requestOptions?: Omit<ApiRequestOptions, "body" | "method">,
      ) => request<T>(url, { ...requestOptions, body, method: "POST" }),
      put: <T>(
        url: string,
        body?: unknown,
        requestOptions?: Omit<ApiRequestOptions, "body" | "method">,
      ) => request<T>(url, { ...requestOptions, body, method: "PUT" }),
      request,
      resetError,
    }),
    [request, resetError, state],
  );
}

