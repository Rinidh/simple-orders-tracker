# Frontend AGENTS.md for simple-orders-tracker

## Purpose

This file documents the recommended UI structure, components, appearance, and developer conventions for the frontend of `simple-orders-tracker`.
It is a concise reference for implementers and future agents working on the mobile-first React app.

## Project structure (recommended)

- `frontend/src/`
  - `App.tsx` — main router + shell
  - `index.css` / `theme.css` — global styles and tokens
  - `pages/`
    - `OrdersPage.tsx`
    - `OrderDetailPage.tsx`
    - `NewOrderPage.tsx`
    - `ReportsPage.tsx`
  - `components/`
    - `OrderCard.tsx`
    - `OrderList.tsx`
    - `OrderForm.tsx`
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
  - List of orders (active first), `FilterBar`, live search, quick summary row
  - Supports pull-to-refresh (mobile) and infinite scroll or page size control

- OrderDetailPage
  - Full order header (customer, contact, notes)
  - Itemized list with qty/price, totals (subtotal, tax, total)
  - Status control (timeline or dropdown) and payment toggle
  - Inline edits for small fields and a clear Save action

- NewOrderPage
  - Dynamic `OrderForm` with add/remove item rows
  - Live total calculation and validation
  - Quick templates / recently used items (optional)

- ReportsPage
  - `SummaryTiles` for weekly totals, income, outstanding balance, counts
  - Date-range controls and simple bar chart or sparkline

## Core components (concise)

- `OrderCard`
  - Compact card used in lists. Shows: customer, total, small item summary, colored `StatusBadge`, payment chip, time
  - Quick actions: update status, mark paid, open detail

- `OrderList`
  - Virtualized or paginated list container rendering `OrderCard`s

- `OrderForm`
  - Reusable inputs for items (name, qty, price), customer info, notes, payment

- `StatusBadge`
  - Small pill with color and icon reflecting lifecycle states

- `FilterBar`
  - Chips for statuses, toggles for payment, date-range shortcuts, search input

- `BottomNav`
  - Primary app navigation: Orders, New Order, Reports

## Hooks & data flow

- `useApi` should centralize fetch logic, auth header handling, retry/backoff, and JSON error shapes.
- `useOrders` handles list fetching, filters, optimistic updates for status changes, and cache invalidation.
- `useOrder` supports loading a single order, patching status/payment, and optimistic UI updates.

API endpoints mapping

- GET `/api/orders` — list with query params: `status`, `paymentReceived`, `customerName`, `startDate`, `endDate`, `page`, `limit`
- GET `/api/orders/:id` — single order
- POST `/api/orders` — create order
- PUT `/api/orders/:id` — full update
- PATCH `/api/orders/:id/status` — update status
- PATCH `/api/orders/:id/payment` — update payment flag
- GET `/api/reports` — aggregated metrics (weekly, date-range)

## Appearance & design tokens

- Core tokens (suggested):
  - Colors: `--bg`, `--surface`, `--text`, `--accent`, `--muted`, `--danger`, `--success`
  - Spacing scale: `4,8,12,16,24` pixels base
  - Radii: `4px`, `8px` for cards
  - Elevation: subtle shadow for cards on mobile

- Status color mapping (recommended):
  - Ordered: `--accent` (blue)
  - Preparing: amber/orange
  - Ready: teal
  - Out for Delivery: purple
  - Delivered: green
  - Paid: success/green with check icon

- Typography & scale
  - Use system fonts, medium size for primary text, compact secondary text
  - 14–16px body, 18–20px card headings, 12px micro copy

## UX patterns

- Mobile-first layout: single-column lists, edge-to-edge cards, large touch targets
- Bottom navigation with primary actions reachable by thumb
- Use color + icon + text in badges for quick recognition
- Inline affordances: swiping a card for quick actions (optional)
- Confirmations for destructive actions (delete, refund)

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

## Testing & linting

- Unit test hooks and pure utils (e.g., totals, validation)
- Component-level tests for key flows: create order, change status, mark payment
- E2E smoke tests for Orders → Detail → Status updates (optional)

## Performance & offline considerations (notes)

- Keep bundle small: prefer tiny utility libraries or vanilla helpers
- Cache recent orders locally for offline-ish resilience and faster UI
- Debounce search and limit frequent polling; prefer webhooks or real-time only if needed

## Useful UX copy examples

- Order card action: `Mark ready`, `Out for delivery`, `Delivered`, `Mark paid`
- Empty state for orders: `No active orders — pull to refresh or create one.`

## Implementation checklist (quick)

- [ ] Scaffold pages and routes
- [ ] Create `useApi`, `useOrders`, `useOrder` hooks
- [ ] Implement `OrderList` + `OrderCard`
- [ ] Implement `OrderForm` and `NewOrderPage`
- [ ] Implement `ReportsPage` with `SummaryTiles`
- [ ] Add theming tokens and global styles
- [ ] Add tests for core flows

---

Keep this file concise; expand component docs in `frontend/src/components/` as needed.
