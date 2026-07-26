import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { statusStyles } from "../constants/orderStatusStyles";
import type { Order } from "../types/orders";
import {
  formatCurrency,
  formatDate,
  getNextStatus,
  summarizeItems,
} from "../utils/orders";

type OrderCardProps = {
  order: Order;
  onOpenDetail?: (order: Order) => void;
  onStatusChange?: (order: Order) => void;
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
  isUpdating = false,
}: OrderCardProps) => {
  const [isConfirmingStatusAdvance, setIsConfirmingStatusAdvance] =
    useState(false);
  const nextStatus = getNextStatus(order.status);
  const canAdvanceStatus =
    nextStatus !== order.status && Boolean(onStatusChange);
  const nextStatusStyle = statusStyles[nextStatus].className;

  const handleCardClick = () => {
    onOpenDetail?.(order);
  };

  const closeStatusConfirmation = () => {
    setIsConfirmingStatusAdvance(false);
  };

  const handleConfirmStatusAdvance = () => {
    closeStatusConfirmation();
    onStatusChange?.(order);
  };

  return (
    <>
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
        <div className="flex gap-4 flex-row items-start justify-between">
          <div className="min-w-0 flex-1 space-y-2">
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

          <div className="flex shrink-0 flex-col items-start gap-3">
            <div
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <StatusBadge
                status={order.status}
                className="max-w-full"
                editable={true}
                disabled={!canAdvanceStatus || isUpdating}
                onChange={() => {
                  setIsConfirmingStatusAdvance(true);
                }}
              />
            </div>

            <span className={getPaymentChipClassName(order.paymentReceived)}>
              {order.paymentReceived ? "Payment received" : "Payment pending"}
            </span>

            <p className="text-lg font-bold text-gray-50">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </article>

      {isConfirmingStatusAdvance ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="presentation"
          onClick={closeStatusConfirmation}
        >
          <div
            aria-labelledby="status-confirmation-title"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-md text-white p-5 bg-gray-950 shadow-xl"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close status confirmation"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold leading-none text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900"
              onClick={closeStatusConfirmation}
            >
              ×
            </button>

            <h2
              id="status-confirmation-title"
              className="pr-8 text-lg font-semibold leading-9"
            >
              Are you sure you want to advance status to{" "}
              <span
                className={`${nextStatusStyle} p-1 px-1.5 rounded-xl border`}
              >
                {nextStatus}
              </span>{" "}
              ?
            </h2>

            <div className="mt-5 flex justify-between gap-3">
              <button
                type="button"
                className="flex-1 min-h-8 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-100 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-100"
                onClick={closeStatusConfirmation}
              >
                No
              </button>
              <button
                type="button"
                className="flex-1 min-h-8 rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={handleConfirmStatusAdvance}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
