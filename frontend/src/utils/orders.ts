import type { OrderItem, OrderStatus, PaymentMethod } from "../types/orders";

export const ORDER_STATUSES: OrderStatus[] = [
  "Ordered",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Paid",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Mobile Money",
  "Card",
  "Bank Transfer",
  "Other",
];

export function getNextStatus(status: OrderStatus): OrderStatus {
  const currentIndex = ORDER_STATUSES.indexOf(status);
  const nextStatus = ORDER_STATUSES[currentIndex + 1];

  return nextStatus ?? "Paid";
}

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}

export function formatCurrency(
  amount: number,
  currency = "UGX",
  locale = "en-UG",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  locale = "en-UG",
): string {
  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function summarizeItems(items: OrderItem[]): string {
  if (items.length === 0) {
    return "No items";
  }

  return items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");
}
