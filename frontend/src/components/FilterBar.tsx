import { useEffect, useMemo, useState } from "react";
import type { OrderFilters, OrderStatus } from "../types/orders";
import { ORDER_STATUSES } from "../utils/orders";

type FilterBarProps = {
  filters: OrderFilters;
  searchText: string;
  onStatusChange: (status: OrderStatus | undefined) => void;
  onPaymentFilterChange: (paymentReceived: boolean | undefined) => void;
  onSearchChange: (searchText: string) => void;
  onClearFilters?: () => void;
};

function getNextPaymentFilter(
  paymentReceived: boolean | undefined,
): boolean | undefined {
  if (paymentReceived === undefined) {
    return true;
  }

  if (paymentReceived) {
    return false;
  }

  return undefined;
}

function getPaymentLabel(paymentReceived: boolean | undefined): string {
  if (paymentReceived === true) {
    return "Paid";
  }

  if (paymentReceived === false) {
    return "Unpaid";
  }

  return "Payment";
}

export const FilterBar = ({
  filters,
  searchText,
  onStatusChange,
  onPaymentFilterChange,
  onSearchChange,
  onClearFilters,
}: FilterBarProps) => {
  const [draftSearchText, setDraftSearchText] = useState(searchText);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      if (draftSearchText !== searchText) {
        onSearchChange(draftSearchText);
      }
    }, 300);

    return () => window.clearTimeout(debounceId);
  }, [draftSearchText, onSearchChange, searchText]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.status ||
        filters.paymentReceived !== undefined ||
        draftSearchText.trim(),
      ),
    [draftSearchText, filters.paymentReceived, filters.status],
  );

  const paymentLabel = getPaymentLabel(filters.paymentReceived);
  const hasPaymentFilter = filters.paymentReceived !== undefined;
  const handleClearFilters = () => {
    setDraftSearchText("");
    onClearFilters?.();
  };

  return (
    <section
      className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-2"
      aria-label="Order filters"
    >
      <div className="flex flex-wrap items-center gap-2">
        <svg
          className="h-5 w-5 text-gray-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M3 5h18" strokeLinecap="round" strokeWidth="2" />
          <path d="M6 12h12" strokeLinecap="round" strokeWidth="2" />
          <path d="M10 19h4" strokeLinecap="round" strokeWidth="2" />
        </svg>

        <label className="sr-only" htmlFor="order-status-filter">
          Filter by status
        </label>
        <select
          id="order-status-filter"
          value={filters.status ?? ""}
          onChange={(event) =>
            onStatusChange(
              (event.target.value || undefined) as OrderStatus | undefined,
            )
          }
          className="min-h-9 rounded-sm border-2 border-gray-200 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-pressed={hasPaymentFilter}
          title="Cycle payment filter"
          onClick={() =>
            onPaymentFilterChange(getNextPaymentFilter(filters.paymentReceived))
          }
          className={[
            "min-h-9 rounded-sm border-2 px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900",
            filters.paymentReceived === true
              ? "border-green-300 bg-green-200 text-green-950 hover:bg-green-100"
              : "",
            filters.paymentReceived === false
              ? "border-red-300 bg-red-200 text-red-950 hover:bg-red-100"
              : "",
            filters.paymentReceived === undefined
              ? "border-gray-200 bg-transparent text-gray-100 hover:bg-gray-100 hover:text-gray-900"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {paymentLabel}
        </button>

        {hasActiveFilters && onClearFilters ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className="min-h-9 rounded-sm border-2 border-gray-700 px-3 py-1 text-sm font-medium text-gray-200 transition-colors hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="relative flex-1 min-w-[14rem] max-w-md max-[495px]:mt-1">
        <svg
          className="pointer-events-none absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2" />
        </svg>
        <label className="sr-only" htmlFor="order-search">
          Search orders
        </label>
        <input
          id="order-search"
          type="search"
          value={draftSearchText}
          onChange={(event) => setDraftSearchText(event.target.value)}
          placeholder="Search orders"
          className="min-h-9 w-full rounded-sm border-2 border-gray-200 bg-gray-50 p-1 pl-9 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
        />
      </div>
    </section>
  );
};
