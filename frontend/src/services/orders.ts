import { apiRequest } from "../hooks/useApi";
import type { ApiListResponse, ApiResponse } from "../types/api";
import type {
  CreateOrderPayload,
  Order,
  OrderFilters,
  OrderStatus,
  UpdateOrderPayload,
} from "../types/orders";

const ORDERS_API_PATH = "/api/orders";

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

export async function listOrders(
  filters?: OrderFilters,
): Promise<ApiListResponse<Order>> {
  return apiRequest<ApiListResponse<Order>>(buildOrderFiltersUrl(filters));
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
  return apiRequest<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}`);
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<ApiResponse<Order>> {
  return apiRequest<ApiResponse<Order>>(ORDERS_API_PATH, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrder(
  id: string,
  payload: UpdateOrderPayload,
): Promise<ApiResponse<Order>> {
  return apiRequest<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ApiResponse<Order>> {
  return apiRequest<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function updateOrderPayment(
  id: string,
  paymentReceived: boolean,
): Promise<ApiResponse<Order>> {
  return apiRequest<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}/payment`, {
    method: "PATCH",
    body: { paymentReceived },
  });
}

export async function deleteOrder(id: string): Promise<ApiResponse<Order>> {
  return apiRequest<ApiResponse<Order>>(`${ORDERS_API_PATH}/${id}`, {
    method: "DELETE",
  });
}
