import { FilterBar } from "../components/FilterBar";
import { useOrders } from "../hooks/useOrders";

export const OrdersPage = () => {
  const { clearFilters, filters, searchText, setSearchText, updateFilter } =
    useOrders();

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
        <div className="bg-gray-700 h-[7em] rounded-md flex items-center justify-center ">
          Order 1
        </div>
        <div className="bg-gray-700 h-[7em] rounded-md flex items-center justify-center ">
          Order 2
        </div>
        <div className="bg-gray-700 h-[7em] rounded-md flex items-center justify-center ">
          Order 3
        </div>
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
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16M4 12h16"
          />
        </svg>
      </button>
    </div>
  );
};
