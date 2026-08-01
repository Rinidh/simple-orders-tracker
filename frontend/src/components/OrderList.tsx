import { useEffect, useMemo, useState } from "react";
import { OrderCard } from "./OrderCard";
import type { Order } from "../types/orders";

type OrderListProps = {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  onStatusChange: (order: Order) => void;
  pageSize?: number;
};

export const OrderList = ({
  orders,
  isLoading,
  error,
  onStatusChange,
  pageSize = 12,
}: OrderListProps) => {
  const [visiblePages, setVisiblePages] = useState(1);

  // Whenever filters/search change, the orders array changes.
  // Reset so the user starts from the beginning again.
  useEffect(() => {
    setVisiblePages(1);
  }, [orders]);

  const visibleCount = visiblePages * pageSize;

  const visibleOrders = useMemo(
    () => orders.slice(0, visibleCount),
    [orders, visibleCount],
  );

  const hasMore = visibleCount < orders.length;

  if (isLoading) {
    return (
      <main className="mt-4 grid gap-4 grid-cols-autofit p-4">
        <div className="rounded-md bg-gray-700 p-4 text-center text-gray-200">
          Loading orders...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mt-4 grid gap-4 grid-cols-autofit p-4">
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-200 p-4 text-sm font-semibold text-red-950"
        >
          {error.message}
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="mt-4 grid gap-4 grid-cols-autofit p-4">
        <div className="rounded-md bg-gray-700 p-4 text-center text-gray-200">
          No orders found.
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mt-4 grid gap-4 grid-cols-autofit p-4">
        {visibleOrders.map((order) => (
          <OrderCard
            key={
              order._id ??
              order.id ??
              `${order.customerName}-${order.orderDate}`
            }
            order={order}
            onStatusChange={onStatusChange}
          />
        ))}
      </main>

      {hasMore ? (
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisiblePages((pages) => pages + 1)}
            className="rounded-md border border-gray-400 bg-gray-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Load More
          </button>
        </div>
      ) : null}
    </>
  );
};
