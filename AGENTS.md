# AGENTS.md for simple-orders-tracker

## Purpose

This repository contains a monolithic MERN stack application for a home snack business. The app helps track incoming orders, update preparation/delivery/payment status, and generate weekly sales and income summaries. The UI is designed for small screens and Android-style mobile use.

## Project Scope

- Order creation and tracking
- Order status workflow: Ordered, Preparing, Ready, Out for Delivery, Delivered, Paid
- Snack item details, quantities, pickup/delivery notes, payment status
- Weekly and date-range sales/income summaries
- Customer/contact and order history
- Mobile-first responsive interface
- Backend API that serves the React frontend

## Architecture

- `backend/` — Node.js / Express server, MongoDB models, API routes
- `frontend/` — React app with mobile-first layout and small-screen navigation
- Monorepo style: backend serves frontend static assets in production
- Shared app name: `simple-orders-tracker`

## Agent Guidance

### Privacy boundaries

- Do not read `reminders.txt` during normal execution. It contains personal reminders and notes, and agents should only open it if the user explicitly asks.

### Recommended stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Deployment: single server or cloud app with backend serving frontend build

### Data model concepts

- Order:
  - customer name, contact, address/pickup notes
  - items list, quantity, price, total amount
  - date of order, time of order, date of delivery, time of delivery, payment method
  - status lifecycle, payment received flag
- Summary:
  - daily/weekly sales totals
  - income vs. outstanding balance
  - orders completed vs. pending

### Core features

- CRUD order management
- Status updates through order lifecycle
- Order detail view with payment/delivery tracking
- Weekly sales summary dashboard
- Search and filter by order status, date, customer
- Mobile-friendly navigation and accessible controls

## Developer conventions

- Keep backend API routes under `backend/`
- Keep frontend screens under `frontend/src/`
- Use TypeScript for backend and frontend application code
- Use REST endpoints like `/api/orders`, `/api/reports`
- Build frontend with small-screen-first CSS and touch-friendly UI
- Document component and API conventions for future agents
- In backend code, use custom error classes from `backend/errors/` and throw instances of those classes from controllers and middleware so API errors are handled consistently
- Do major calculations on backend and frontend consumes results e.g. metrics from backend `/api/reports` endpoint consumed by `useReports`

## Implementation notes

- Serve frontend build from backend in production
- Use one MongoDB database for orders and reports
- Prefer reusable mobile components and compact list layouts
- Ensure status changes and payment updates sync correctly
- Keep report metric definitions centralized in the backend: paid sales count orders with `status: "Paid"` and `paymentReceived: true`, completed orders are `Delivered` or `Paid`, and outstanding balance is the total for unpaid orders

## Logging

The backend uses **Winston** for centralized logging across multiple transports:

### Usage in Code

```typescript
import logger from "./logger";

logger.debug("Cache refreshed", { cacheKey });
logger.info("Order created", { orderId });
logger.warn("Payment pending", { orderId });
logger.error("Database connection failed", { error: err });
```

### Logging Rules

- Use the shared Winston logger instance instead of console.log
- Use appropriate log levels: `debug`, `info`, `warn`, `error`
- Include relevant context as metadata (e.g., IDs, user info, request data, error instances)
- Logs are written to:
  - console
  - log files in logs/
  - MongoDB (logs collection) when configured
- MongoDB transport is initialized at runtime in backend/server.ts after environment variables are loaded
- Errors should use shared custom error classes from backend/errors/ for consistent logging and handling
- Check `logs/` directory for file-based logs during development
- Query the `logs` collection in MongoDB for production log retention and analysis

## Getting Started

- `cd backend` and install backend dependencies
- `cd frontend` and install frontend dependencies
- Local run: backend and frontend can be started separately during development
- Production: backend serves the compiled frontend bundle

## Testing & Validation

- Validate mobile layout manually on small screens
- Verify order lifecycle transitions and report calculations
- Confirm backend API returns correct order summaries
