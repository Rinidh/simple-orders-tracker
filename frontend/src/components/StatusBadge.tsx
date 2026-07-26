import type { OrderStatus } from "../types/orders";
import { getNextStatus } from "../utils/orders";
import { statusStyles } from "../constants/orderStatusStyles";

type StatusBadgeProps = {
  status: OrderStatus;
  onChange?: (status: OrderStatus) => void;
  editable?: boolean;
  disabled?: boolean;
  className?: string;
};

const iconClass = "h-4 w-4 shrink-0";

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
