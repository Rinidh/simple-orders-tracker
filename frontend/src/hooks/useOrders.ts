import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError } from "./useApi";
import {
  listOrders,
  updateOrderPayment,
  updateOrderStatus,
} from "../services/orders";
import type { Order, OrderFilters, OrderStatus } from "../types/orders";
import { getNextStatus } from "../utils/orders";

type UseOrdersOptions = {
  initialFilters?: OrderFilters;
};

type OrderFilterValue<K extends keyof OrderFilters> = OrderFilters[K];

function normalizeError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError("Unable to load orders. Please try again.");
}

function getOrderId(order: Order): string | undefined {
  return order._id ?? order.id;
}

function replaceOrderById(
  orders: Order[],
  id: string,
  update: (order: Order) => Order,
): Order[] {
  return orders.map((order) =>
    getOrderId(order) === id ? update(order) : order,
  );
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState<OrderFilters>(
    options.initialFilters ?? {},
  );
  const [searchText, setSearchText] = useState(
    options.initialFilters?.customerName ?? "",
  );
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const requestFilters = useMemo<OrderFilters>(() => {
    const trimmedSearch = searchText.trim();
    const nextFilters = { ...filters };

    if (trimmedSearch.length > 0) {
      nextFilters.customerName = trimmedSearch;
    } else {
      delete nextFilters.customerName;
    }

    return nextFilters;
  }, [filters, searchText]);

  const refresh = useCallback(() => {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof OrderFilters>(key: K, value: OrderFilterValue<K>) => {
      setFilters((currentFilters) => {
        const nextFilters = { ...currentFilters };

        if (value === undefined || value === "") {
          delete nextFilters[key];
        } else {
          nextFilters[key] = value;
        }

        return nextFilters;
      });
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchText("");
  }, []);

  const optimisticallyUpdateOrder = useCallback(
    async (
      id: string,
      optimisticUpdate: (order: Order) => Order,
      request: () => Promise<Order>,
    ) => {
      const previousOrders = orders;

      setOrders((currentOrders) =>
        replaceOrderById(currentOrders, id, optimisticUpdate),
      );
      setError(null);

      try {
        const updatedOrder = await request();
        setOrders((currentOrders) =>
          replaceOrderById(currentOrders, id, () => updatedOrder),
        );
        return updatedOrder;
      } catch (caughtError) {
        const normalizedError = normalizeError(caughtError);
        setOrders(previousOrders);
        setError(normalizedError);
        throw normalizedError;
      }
    },
    [orders],
  );

  const quickUpdateStatus = useCallback(
    (id: string, status: OrderStatus) =>
      optimisticallyUpdateOrder(
        id,
        (order) => ({ ...order, status }),
        async () => {
          const response = await updateOrderStatus(id, status);
          return response.data;
        },
      ),
    [optimisticallyUpdateOrder],
  );

  const quickAdvanceStatus = useCallback(
    (order: Order) => {
      const id = getOrderId(order);

      if (!id) {
        const missingIdError = new ApiRequestError(
          "Order is missing an id and cannot be updated.",
        );
        setError(missingIdError);
        return Promise.reject(missingIdError);
      }

      return quickUpdateStatus(id, getNextStatus(order.status));
    },
    [quickUpdateStatus],
  );

  const quickUpdatePayment = useCallback(
    (id: string, paymentReceived: boolean) =>
      optimisticallyUpdateOrder(
        id,
        (order) => ({ ...order, paymentReceived }),
        async () => {
          const response = await updateOrderPayment(id, paymentReceived);
          return response.data;
        },
      ),
    [optimisticallyUpdateOrder],
  );

  useEffect(() => {
    let isCurrentRequest = true;

    async function fetchOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listOrders(requestFilters);

        if (!isCurrentRequest) {
          return;
        }

        // setOrders(response.data);
        setOrders([
          {
            _id: "_id val",
            id: "id val",
            customerName: "name",
            contact: "phone no.",
            addressOrPickupNotes: "notes",
            items: [
              {
                name: "item name",
                quantity: 1,
                price: 10,
              },
            ],
            totalAmount: 100,
            orderDate: "2026-01-01",
            orderTime: "06:00",
            deliveryDate: "2026-01-01",
            deliveryTime: "06: 00",
            paymentMethod: "Cash",
            status: "Ordered",
            paymentReceived: false,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
          },
        ]);
        setCount(response.count);
      } catch (caughtError) {
        if (!isCurrentRequest) {
          return;
        }

        setError(normalizeError(caughtError));
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isCurrentRequest = false;
    };
  }, [requestFilters, refreshIndex]);

  return {
    clearFilters,
    count,
    error,
    filters,
    isLoading,
    orders,
    quickAdvanceStatus,
    quickUpdatePayment,
    quickUpdateStatus,
    refresh,
    resetError,
    searchText,
    setFilters,
    setSearchText,
    updateFilter,
  };
}
