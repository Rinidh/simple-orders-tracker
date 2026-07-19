import { FilterBar } from "../components/FilterBar";
import { OrderCard } from "../components/OrderCard";
import { useOrders } from "../hooks/useOrders";

export const OrdersPage = () => {
  const {
    clearFilters,
    error,
    filters,
    isLoading,
    orders,
    quickAdvanceStatus,
    quickUpdatePayment,
    searchText,
    setSearchText,
    updateFilter,
  } = useOrders();

  return (
    <div>
      <FilterBar
        filters={filters}
        searchText={searchText}
        onStatusChange={(status) => updateFilter("status", status)}
        onPaymentFilterChange={(paymentReceived) =>
          updateFilter("paymentReceived", paymentReceived)
        }
        onSearchChange={setSearchText}
        onClearFilters={clearFilters}
      />

      <main className="mt-4 p-4 grid gap-4 grid-cols-autofit">
        {isLoading ? (
          <div className="rounded-md bg-gray-700 p-4 text-center text-gray-200">
            Loading orders...
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-md border border-red-300 bg-red-200 p-4 text-sm font-semibold text-red-950"
            role="alert"
          >
            {error.message}
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="rounded-md bg-gray-700 p-4 text-center text-gray-200">
            No orders found.
          </div>
        ) : null}

        {orders.map((order) => (
          <OrderCard
            key={
              order._id ??
              order.id ??
              `${order.customerName}-${order.orderDate}`
            }
            order={order}
            // onOpenDetail={() => {}} // TODO: to implement opening OrderDetailPanel after it is created
            onStatusChange={(selectedOrder) => {
              void quickAdvanceStatus(selectedOrder);
            }}
            onMarkPaid={(selectedOrder) => {
              const orderId = selectedOrder._id ?? selectedOrder.id;

              if (orderId) {
                void quickUpdatePayment(orderId, true);
              }
            }}
          />
        ))}
      </main>

      <button
        aria-label="Add"
        title="Add"
        className="sm:hidden fixed bottom-20 right-5 h-14 w-14 rounded-full bg-gray-50 text-gray-800 flex items-center justify-center shadow-md hover:bg-gray-300 transition-colors focus:outline-none cursor-pointer"
      >
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16M4 12h16"
          />
        </svg>
      </button>
    </div>
  );
};
