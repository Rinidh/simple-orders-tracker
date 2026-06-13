# Frontend AGENTS.md for simple-orders-tracker

## Purpose

This file documents the recommended UI structure, components, appearance, and developer conventions for the frontend of `simple-orders-tracker`.
It is a concise reference for implementers and future agents working on the mobile-first React app.

## Project structure (recommended)

- `frontend/src/`
  - `App.tsx` — main router + shell
  - `index.css` — global styles and tokens
  - `pages/`
    - `OrdersPage.tsx`
    - `NewOrderPage.tsx`
    - `ReportsPage.tsx`
  - `components/`
    - `OrderCard.tsx`
    - `ItemCard.tsx`
    - `ItemList.tsx`
    - `OrderList.tsx`
    - `OrderDetailPanel.tsx`
    - `StatusBadge.tsx`
    - `FilterBar.tsx`
    - `SummaryTiles.tsx`
    - `BottomNav.tsx`
    - `Header.tsx`
  - `hooks/`
    - `useApi.ts` — fetch wrapper, error handling
    - `useOrders.ts` — list queries, filters, pagination
    - `useOrder.ts` — single-order fetch + mutations
    - `useReports.ts` — reports + aggregations
  - `services/`
    - `orders.ts` — calls to `/api/orders`
    - `reports.ts` — calls to `/api/reports`
  - `types/` — shared TypeScript interfaces
  - `utils/` — helpers (formatting, totals, validators)

## Pages & responsibilities

- OrdersPage
  - List of orders (last ordered first), `FilterBar`, live search, quick summary row
  - Supports pull-to-refresh (mobile) and infinite scroll or page size control
  - Shows `OrderList` with `OrderCard`s
  - Add button in bottom right for adding new orders

- NewOrderPage
  - Customer name input
  - Contact input
  - `ItemList` with one empty `ItemCard`
  - Total amount display; live totals calculation and validation
  - A row with Payment method dropdown, Payment Received chip (toggle)
  - When Payment Received is true, Payment Method can only be set to 'Cash'

- ReportsPage
  - Date-range controls; default set to previous one week
  - `SummaryTiles` for total sales, outstanding balance (unpaid yet), orders completed out of all created, total items created
  - simple bar chart or sparkline of total sales per day

## Core components

- `OrderCard`
  - Spacious, non-compact card
  - Left column: customer name, item names summary (comma separated), delivery date (deadline)
  - Right column: colored `StatusBadge`, Payment Received chip, total amount
  - Quick actions: update status, mark paid
  - Clicking/touching it opens `OrderDetailPanel` with more info

- `OrderList`
  - Virtualized or paginated list container rendering `OrderCard`s

- `ItemCard`
  - Item name input; spans full width of parent
  - Quantity input dropdown with values: 250 gm, 500 gm, 1kg, custom. Selecting 'Custom' allows inputting a non-negative integer. Quantity input spans half width of parent
  - Payment Received chip (toggle); displays 'Yes' with green background and 'No' with red background
  - Cross button at top right to delete `ItemCard` from `ItemList`

- `ItemList`
  - List container with `ItemCard`s
  - A button to add more `ItemCard`s

- `OrderDetailPanel`
  - A drawer that slides in from bottom and overlays displayed components
  - Header with customer name
  - Customer contact below name in smaller font size
  - Items table with item name, qty, price, and totals for price
  - Two column layout:
    - Left column: `StatusBadge`, deadline to deliver (delivery date), order date (dates are unchangeable, they are only displayed)
    - Right column: Payment method dropdown, Payment Received chip
  - Address or Pickup Notes input that is editable
  - A clear Save action button that is disabled unless changes made

- `StatusBadge`
  - Big visible pill with background colors, icons and text reflecting lifecycle states
  - Clicking/touching on it changes it to next lifecycle state

- `FilterBar`
  - Filters for cards: Dropdown for statuses, chip for payment received
  - Search input

- `BottomNav`
  - Primary app navigation: Home (`OrdersPage`), New Order (`NewOrderPage`), Reports (`ReportsPage`)

## Hooks & data flow

- `useApi` should centralize fetch logic, auth header handling, retry/backoff, and JSON error shapes.
- `useOrders` handles list fetching, filters, optimistic updates for status changes, and cache invalidation.
- `useOrder` supports loading a single order, patching status/payment, and optimistic UI updates.

API endpoints mapping

- GET `/api/orders` — list with query params: `status`, `paymentReceived`, `customerName`, `startDate`, `endDate`
- GET `/api/orders/:id` — single order
- POST `/api/orders` — create order
- PUT `/api/orders/:id` — full update
- PATCH `/api/orders/:id/status` — update status
- PATCH `/api/orders/:id/payment` — update payment flag
- DELETE `/api/orders/:id` —
- GET `/api/reports` — aggregated metrics (date-range)

## Appearance & design tokens

- Use Tailwind utility classes directly; there are no CSS custom properties in the current app shell.
- Current color system:
  - App background: `bg-gray-900`
  - Primary text: `text-white`
  - Header/footer surfaces: `bg-gray-800`
  - Cards/content surfaces: `bg-gray-700`
  - Borders and icon strokes: `border-gray-200`, `border-gray-700`, `text-gray-200`, `text-gray-400`
  - Light action surface: `bg-gray-50 text-gray-800`, with hover states such as `hover:bg-gray-300`
- Layout and spacing:
  - App shell uses `min-h-screen`.
  - Header uses `h-[10vh]`, `flex`, `items-center`, `justify-between`, and `shadow-md`.
  - Filter/search row uses `flex flex-wrap`, `px-4`, `py-2`, `max-w-4xl`, and responsive wrapping for narrow screens.
  - Main content uses `grid gap-4 grid-cols-autofit` with `p-4`.
  - Mobile navigation is fixed to the bottom with `sm:hidden`; the add action is a fixed circular button above it.
- Shape and elevation:
  - Use `rounded-sm` for compact controls and inputs.
  - Use `rounded-md` for images and order cards.
  - Use `rounded-full` for profile images and floating action buttons.
  - Use `shadow-md` for prominent fixed or shell elements.
- Typography:
  - The title uses `font-mono`, uppercase text, `tracking-[.5em]`, and responsive sizing from `text-xs` to `sm:text-base`.
  - Bottom nav labels use `text-xs`.
  - Keep page text compact and high contrast against the dark background.

## UX patterns

- Mobile-first layout: single-column lists, edge-to-edge cards, large touch targets
- Bottom navigation with primary actions reachable by thumb
- Use color + icon + text in badges for quick recognition
- Confirmations for destructive actions (delete, cancel)

## Accessibility

- Ensure contrast ratios meet WCAG AA for text and UI elements
- Add accessible names and roles for buttons and inputs
- Keyboard focus states and logical tab order
- Use semantic HTML where possible and aria-live for status updates

## Developer conventions

- Use TypeScript across components and hooks with shared `types/` definitions
- Centralize API URLs in `services/` and the fetch wrapper in `hooks/useApi.ts`
- Keep components small and focused: presentational vs container separation
- Use `StatusBadge` + enums from `types/` to avoid stringly-typed status code usage
- Keep this file concise; expand component docs in `frontend/src/components/` as needed.

## Testing & linting

- Unit test hooks and pure utils (e.g., totals, validation)
- Component-level tests for key flows: create order, change status, mark payment
- E2E smoke tests for Orders → Detail → Status updates (optional)

## Performance & offline considerations (notes)

- Keep bundle small: prefer tiny utility libraries or vanilla helpers
- Cache recent orders locally for offline-ish resilience and faster UI
- Debounce search and limit frequent polling; prefer webhooks or real-time only if needed
