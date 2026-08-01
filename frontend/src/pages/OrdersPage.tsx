import { FilterBar } from "../components/FilterBar";
import { OrderList } from "../components/OrderList";
import { useOrders } from "../hooks/useOrders";

export const OrdersPage = () => {
  const {
    clearFilters,
    error,
    filters,
    isLoading,
    orders,
    quickAdvanceStatus,
    searchText,
    setSearchText,
    updateFilter,
    quickUpdatePayment,
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

      <OrderList
        orders={orders}
        isLoading={isLoading}
        error={error}
        pageSize={2}
        onStatusChange={(selectedOrder) => {
          if (
            selectedOrder.status === "Delivered" &&
            (selectedOrder._id || selectedOrder.id)
          ) {
            void quickUpdatePayment(
              selectedOrder._id ?? selectedOrder.id,
              true,
            );
          }

          void quickAdvanceStatus(selectedOrder);
        }}
      />

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
