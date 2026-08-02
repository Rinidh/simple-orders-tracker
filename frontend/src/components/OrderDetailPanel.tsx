// File: OrderDetailPanel.tsx
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import type { Order, OrderStatus, PaymentMethod } from "../types/orders";
import { formatCurrency, formatDate, getNextStatus } from "../utils/orders";

type OrderDetailPanelProps = {
  order: Order | null;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => Promise<void> | void; // Persist the updated order when saved
};

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "Mobile Money",
  "Card",
  "Bank Transfer",
  "Other",
];

function getPaymentChipClassName(paymentReceived: boolean) {
  return [
    "inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
    paymentReceived
      ? "border-green-300 bg-green-200 text-green-950"
      : "border-red-300 bg-red-200 text-red-950",
  ].join(" ");
}

export const OrderDetailPanel = ({
  order,
  isOpen,
  isSaving = false,
  onClose,
  onSave,
}: OrderDetailPanelProps) => {
  const [draft, setDraft] = useState<Order | null>(null);

  // Reset local draft whenever another order is opened.
  useEffect(() => {
    if (order) {
      setDraft(structuredClone(order));
    }
  }, [order]);

  const hasChanges = useMemo(() => {
    if (!order || !draft) return false;

    return JSON.stringify(order) !== JSON.stringify(draft);
  }, [order, draft]);

  if (!isOpen || !order || !draft) {
    return null;
  }

  const subtotal = draft.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  async function handleSave() {
    if (draft !== null) await onSave(draft);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-gray-900 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between border-b border-gray-700 px-6 py-3">
          <div>
            <h2 id="order-detail-title" className="text-2xl font-bold">
              {draft.customerName}
            </h2>

            <p className="mt-1 text-sm text-gray-300">{draft.contact}</p>
          </div>

          <button
            className="rounded p-2 text-2xl hover:bg-gray-800"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Items */}
          <section>
            <h3 className="mb-3 text-lg font-semibold">Order Items</h3>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {draft.items.map((item) => (
                  <tr key={item.name} className="border-b border-gray-800">
                    <td className="py-3">{item.name}</td>

                    <td className="text-center">{item.quantity}</td>

                    <td className="text-right">{item.price}</td>

                    <td className="text-right font-medium">
                      {item.quantity * item.price}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-semibold">
                    Total
                  </td>

                  <td className="pt-4 text-right text-lg font-bold">
                    {formatCurrency(subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Details */}
          <section className="grid gap-8 md:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm text-gray-400">Status</p>

                <StatusBadge
                  editable
                  status={draft.status}
                  onChange={(status) =>
                    setDraft({
                      ...draft,
                      status,
                    })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-400">Deliver by</p>

                <p className="font-medium">{formatDate(draft.deliveryDate)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Ordered on</p>

                <p className="font-medium">{formatDate(draft.orderDate)}</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Payment Method
                </label>

                <select
                  value={draft.paymentMethod}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-400">Payment Received</p>

                <button
                  type="button"
                  className={getPaymentChipClassName(draft.paymentReceived)}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      paymentReceived: !draft.paymentReceived,
                    })
                  }
                >
                  {draft.paymentReceived
                    ? "Payment received"
                    : "Payment pending"}
                </button>
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium">
              Address / Pickup Notes
            </label>

            <textarea
              id="notes"
              rows={5}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-3"
              value={draft.addressOrPickupNotes}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  addressOrPickupNotes: event.target.value,
                })
              }
            />
          </section>
        </div>

        <footer className="border-t border-gray-700 p-6">
          <button
            type="button"
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
            className="w-full rounded-md bg-white px-4 py-3 font-semibold text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </aside>
    </div>
  );
};
