import type { ReactElement } from "react";
import type { OrderStatus } from "../types/orders";
import { getNextStatus } from "../utils/orders";

type StatusBadgeProps = {
  status: OrderStatus;
  onChange?: (status: OrderStatus) => void;
  editable?: boolean;
  disabled?: boolean;
  className?: string;
};

type StatusStyle = {
  label: string;
  className: string;
  icon: (className: string) => ReactElement;
};

const iconClass = "h-4 w-4 shrink-0";

const statusStyles: Record<OrderStatus, StatusStyle> = {
  Ordered: {
    label: "Ordered",
    className: "bg-sky-100 text-sky-950 border-sky-300",
    icon: (className) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M7 8h10M7 12h6M7 16h4" strokeLinecap="round" strokeWidth="2" />
        <path
          d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  Preparing: {
    label: "Preparing",
    className: "bg-amber-100 text-amber-950 border-amber-300",
    icon: (className) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          d="M4 15h16M6 15a6 6 0 0 1 12 0M12 6v3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M9 4h6" strokeLinecap="round" strokeWidth="2" />
      </svg>
    ),
  },
  Ready: {
    label: "Ready",
    className: "bg-lime-100 text-lime-950 border-lime-300",
    icon: (className) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          d="m5 13 4 4L19 7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  "Out for Delivery": {
    label: "Out for Delivery",
    className: "bg-violet-100 text-violet-950 border-violet-300",
    icon: (className) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          d="M3 7h11v9H3V7ZM14 10h3l3 3v3h-6v-6Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  Delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-950 border-emerald-300",
    icon: (className) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          d="M4 7 12 3l8 4-8 4-8-4Z"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M4 7v10l8 4 8-4V7M12 11v10"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  Paid: {
    label: "Paid",
    className: "bg-green-200 text-green-950 border-green-400",
    icon: (className) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 3v18M17 7.5c-.9-.9-2.4-1.5-4-1.5-2.2 0-4 1.1-4 2.8 0 1.8 1.8 2.4 4 2.9 2.4.5 4 1.2 4 3.1 0 1.8-1.8 3.2-4.3 3.2-1.8 0-3.5-.7-4.7-1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
};

export const StatusBadge = ({
  status,
  onChange,
  editable = false,
  disabled = false,
  className = "",
}: StatusBadgeProps) => {
  const currentStatusStyle = statusStyles[status];
  const nextStatus = getNextStatus(status);
  const isInteractive = editable && Boolean(onChange) && !disabled;

  const baseClassName = [
    "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold leading-tight",
    currentStatusStyle.className,
    isInteractive
      ? "cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
      : "cursor-default",
    disabled ? "opacity-60" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {currentStatusStyle.icon(iconClass)}
      <span>{currentStatusStyle.label}</span>
    </>
  );

  if (!isInteractive) {
    return (
      <span
        className={baseClassName}
        aria-label={`Status: ${currentStatusStyle.label}`}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={baseClassName}
      onClick={() => onChange?.(nextStatus)}
      aria-label={`Change status from ${currentStatusStyle.label} to ${nextStatus}`}
      title={`Change to ${nextStatus}`}
    >
      {content}
    </button>
  );
};
