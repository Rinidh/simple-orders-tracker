import type { ApiError, ApiListResponse, ApiResponse } from "../types/api";
import type {
  CreateOrderPayload,
  Order,
  OrderFilters,
  OrderStatus,
  UpdateOrderPayload,
} from "../types/orders";

const ORDERS_API_PATH = "/api/orders";

type RequestOptions = {
  method?: string;
  body?: unknown;
};

function buildOrderFiltersUrl(filters?: OrderFilters): string {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.paymentReceived !== undefined) {
    params.set("paymentReceived", String(filters.paymentReceived));
  }

  if (filters?.customerName) {
    params.set("customerName", filters.customerName);
  }

  if (filters?.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters?.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();

  return query ? `${ORDERS_API_PATH}?${query}` : ORDERS_API_PATH;
}

async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = (await response.json()) as T | ApiError;

  if (!response.ok) {
    const apiError = data as ApiError;
    throw new Error(apiError.errors?.join(", ") ?? apiError.message);
  }

  return data as T;
}

export async function listOrders(
  filters?: OrderFilters,
): Promise<ApiListResponse<Order>> {
  return request<ApiListResponse<Order>>(buildOrderFiltersUrl(filters));
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
  return request<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}`);
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<ApiResponse<Order>> {
  return request<ApiResponse<Order>>(ORDERS_API_PATH, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrder(
  id: string,
  payload: UpdateOrderPayload,
): Promise<ApiResponse<Order>> {
  return request<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ApiResponse<Order>> {
  return request<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function updateOrderPayment(
  id: string,
  paymentReceived: boolean,
): Promise<ApiResponse<Order>> {
  return request<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}/payment`, {
    method: "PATCH",
    body: { paymentReceived },
  });
}

export async function deleteOrder(id: string): Promise<ApiResponse<Order>> {
  return request<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}`, {
    method: "DELETE",
  });
}
