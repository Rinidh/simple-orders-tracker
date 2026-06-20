# Frontend Component and Hook Build Plan

## Summary

Build the frontend from the structure described in `frontend/AGENTS.md` having typed services, reusable hooks, mobile-first components, and three pages: Orders, New Order, and Reports. Keep Tailwind utility styling, dark app shell, touch-friendly controls, and the existing backend API contract.

## Shared Types, Services, and Utils

1. Create `frontend/src/types/orders.ts`
   - Define `OrderStatus` as: `Ordered | Preparing | Ready | Out for Delivery | Delivered | Paid`.
   - Define `PaymentMethod` as: `Cash | Mobile Money | Card | Bank Transfer | Other`.
   - Define `OrderItem`, `Order`, `OrderFilters`, `CreateOrderPayload`, and `UpdateOrderPayload`.
   - Match backend fields exactly: `customerName`, `contact`, `addressOrPickupNotes`, `items`, `totalAmount`, `orderDate`, `orderTime`, `deliveryDate`, `deliveryTime`, `paymentMethod`, `status`, `paymentReceived`.

2. Create `frontend/src/types/api.ts`
   - Define API envelopes:
     - `ApiResponse<T> = { message: string; data: T }`
     - `ApiListResponse<T> = { message: string; count: number; data: T[] }`
     - `ApiError = { message: string; errors?: string[] }`

3. Create `frontend/src/utils/orders.ts`
   - Add `ORDER_STATUSES`, `PAYMENT_METHODS`, `getNextStatus`, `calculateOrderTotal`, `formatCurrency`, `formatDate`, and `summarizeItems`.
   - `getNextStatus("Paid")` returns `"Paid"`.

4. Create `frontend/src/services/orders.ts`
   - Implement REST calls for:
     - `listOrders(filters)`
     - `getOrder(id)`
     - `createOrder(payload)`
     - `updateOrder(id, payload)`
     - `updateOrderStatus(id, status)`
     - `updateOrderPayment(id, paymentReceived)`
     - `deleteOrder(id)`

5. Create `frontend/src/services/reports.ts`
   - Implement `getReport({ startDate, endDate })`.
   - Keep response typing aligned with current backend: `totalSales`, `totalOrders`, `startDate`, `endDate`.

## Hooks

1. Build `useApi`
   - Centralize `fetch`, JSON parsing, API error normalization, and request state helpers.
   - Support `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
   - Return typed data and throw normalized errors for hooks to display.

2. Build `useOrders`
   - Own order list state, filters, search text, loading, error, and refresh.
   - Fetch `/api/orders` with query params: `status`, `paymentReceived`, `customerName`, `startDate`, `endDate`.
   - Add optimistic helpers for quick status and payment updates.
   - Revert optimistic changes if the API call fails.

3. Build `useOrder`
   - Load one order by id when needed.
   - Expose mutations for full update, status update, payment update, and delete.
   - Track dirty local edits for `OrderDetailPanel`.

4. Build `useReports`
   - Default date range to the previous 7 days.
   - Fetch `/api/reports`.
   - Also fetch `/api/orders` for the same date range to compute frontend-only metrics required by `frontend/AGENTS.md`: outstanding balance, completed count, total order count, total items, and daily sales chart data.
   - Treat backend report totals as the source for paid sales totals.

## Components and Pages

1. Refactor `Header`
   - Move current header markup out of `OrdersPage`.
   - Keep logo/profile layout, dark `bg-gray-800`, `h-[10vh]`, mono uppercase title, and compact responsive text.
   - Use accessible image alt text.

2. Build `BottomNav`
   - Use React Router links for Orders, New Order, and Reports.
   - Keep mobile fixed bottom layout with `sm:hidden`.
   - Use icon plus `text-xs` label.
   - Highlight the active route.

3. Update `App`
   - Add React Router routes:
     - `/` and `/orders` -> `OrdersPage`
     - `/orders/new` -> `NewOrderPage`
     - `/reports` -> `ReportsPage`
   - Render shared app shell with `Header`, route content, `BottomNav`, and bottom padding for mobile nav.

4. Build `StatusBadge`
   - Render large pill with color, icon, and label per status.
   - On click/tap, call `onChange(nextStatus)` when editable.
   - Use disabled/read-only mode for display-only contexts.
   - Status colors should be distinct and readable on dark UI.

5. Build `FilterBar`
   - Include status dropdown, payment received toggle/chip, and search input.
   - Debounce search before updating `useOrders` filters.
   - Keep existing responsive wrapping and compact controls.

6. Build `OrderCard`
   - Spacious `bg-gray-700 rounded-md` card.
   - Left side: customer name, comma-separated item summary, delivery deadline.
   - Right side: `StatusBadge`, payment chip, total amount.
   - Include quick actions for next status and mark paid.
   - Card click opens `OrderDetailPanel`; action buttons stop propagation.

7. Build `OrderList`
   - Render loading, empty, error, and populated states.
   - Render `OrderCard` for each order.
   - Start with simple paginated/page-size rendering rather than virtualization.
   - Keep grid/list mobile-first with `grid gap-4 grid-cols-autofit`.

8. Build `OrderDetailPanel`
   - Bottom drawer overlay with customer name and contact.
   - Show item table with name, quantity, price, and line total.
   - Display status, delivery date, and order date.
   - Allow editing payment method, payment received, and address/pickup notes.
   - Disable Save until local changes differ from the original order.
   - Save through `useOrder.updateOrder`.

9. Build `ItemCard`
   - Controlled inputs for item name, quantity, and price.
   - Quantity options: `250 gm`, `500 gm`, `1kg`, `custom`.
   - Store backend quantity as a number; map presets to numeric values.
   - Show custom non-negative integer input only when `custom` is selected.
   - Include delete button at top right.

10. Build `ItemList`

- Manage an array of draft items.
- Start with one empty item.
- Add item button appends another empty item.
- Prevent deleting the last remaining item.
- Bubble item changes to `NewOrderPage`.

11. Build `NewOrderPage`

- Form fields: customer name, contact, address/pickup notes, order date/time, delivery date/time, payment method, payment received.
- Render `ItemList`.
- Show live total using `calculateOrderTotal`.
- Validate required fields before submit.
- When `paymentReceived` is true, force payment method to `Cash`.
- Submit via `ordersService.createOrder`, then navigate back to `/orders`.

12. Build `SummaryTiles`

- Show total sales, outstanding balance, completed count out of total orders, and total items.
- Use compact tiles with high-contrast labels and values.
- Accept fully computed values from `useReports`.

13. Build `ReportsPage`

- Date range controls default to previous 7 days.
- Render `SummaryTiles`.
- Render a simple sales-per-day bar chart using plain React/CSS.
- Show loading, error, and empty states.

## Test Plan

- Add unit tests for `calculateOrderTotal`, `getNextStatus`, `summarizeItems`, and report aggregation helpers.
- Add hook tests for `useOrders`, `useOrder`, and `useReports` with mocked fetch responses.
- Add component tests for:
  - `StatusBadge` next-status click.
  - `FilterBar` search/filter changes.
  - `ItemList` add/delete behavior.
  - `NewOrderPage` payment-received forcing `Cash`.
  - `OrderDetailPanel` Save disabled until changes exist.
- Run `npm run build`, `npm run lint`, and `npm run test` in `frontend`.

## Assumptions

- No backend changes are included in this frontend plan.
- Missing report metrics will be computed client-side from `/api/orders` until the backend report endpoint expands.
- No new icon dependency is required; use existing inline SVG-style icons unless the project later adds an icon library.
- `reminders.txt` remains unread and out of scope.
