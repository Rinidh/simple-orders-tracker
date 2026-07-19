import { StatusBadge } from "./StatusBadge";
import type { Order, OrderStatus } from "../types/orders";
import {
  formatCurrency,
  formatDate,
  getNextStatus,
  summarizeItems,
} from "../utils/orders";

type OrderCardProps = {
  order: Order;
  onOpenDetail?: (order: Order) => void;
  onStatusChange?: (order: Order, status: OrderStatus) => void;
  onMarkPaid?: (order: Order) => void;
  isUpdating?: boolean;
};

function formatDeadline(order: Order): string {
  const date = formatDate(order.deliveryDate);
  const time = order.deliveryTime?.trim();

  if (date && time) {
    return `${date} at ${time}`;
  }

  return date || time || "No deadline set";
}

function getPaymentChipClassName(paymentReceived: boolean): string {
  return [
    "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold",
    paymentReceived
      ? "border-green-300 bg-green-200 text-green-950"
      : "border-red-300 bg-red-200 text-red-950",
  ].join(" ");
}

export const OrderCard = ({
  order,
  onOpenDetail,
  onStatusChange,
  onMarkPaid,
  isUpdating = false,
}: OrderCardProps) => {
  const nextStatus = getNextStatus(order.status);
  const canAdvanceStatus =
    nextStatus !== order.status && Boolean(onStatusChange);
  const canMarkPaid = !order.paymentReceived && Boolean(onMarkPaid);

  const handleCardClick = () => {
    onOpenDetail?.(order);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open order for ${order.customerName}`}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className="max-w-xl cursor-pointer rounded-md bg-gray-700 p-4 text-white shadow-md transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 sm:flex-1 space-y-2">
          <h2 className="truncate text-lg font-semibold leading-tight">
            {order.customerName}
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-gray-200">
            {summarizeItems(order.items)}
          </p>
          <p className="text-sm font-medium text-gray-300">
            Due {formatDeadline(order)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <StatusBadge status={order.status} className="max-w-full" />

          <span className={getPaymentChipClassName(order.paymentReceived)}>
            {order.paymentReceived ? "Payment received" : "Payment pending"}
          </span>

          <p className="text-lg font-bold text-gray-50">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2 border-t border-gray-600 pt-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          disabled={!canAdvanceStatus || isUpdating}
          onClick={() => onStatusChange?.(order, nextStatus)}
          className="min-h-10 rounded-sm border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canAdvanceStatus ? `Next: ${nextStatus}` : "Status complete"}
        </button>

        <button
          type="button"
          disabled={!canMarkPaid || isUpdating}
          onClick={() => onMarkPaid?.(order)}
          className="min-h-10 rounded-sm border-2 border-green-300 bg-green-200 px-3 py-2 text-sm font-semibold text-green-950 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {order.paymentReceived ? "Paid" : "Mark paid"}
        </button>
      </div>
    </article>
  );
};
