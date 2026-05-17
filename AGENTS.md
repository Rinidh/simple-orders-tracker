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
- Frontend: React, Vite, TypeScript, CSS modules or utility-first responsive styles
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

## Implementation notes

- Serve frontend build from backend in production
- Use one MongoDB database for orders and reports
- Prefer reusable mobile components and compact list layouts
- Ensure status changes and payment updates sync correctly

## Getting Started

- `cd backend` and install backend dependencies
- `cd frontend` and install frontend dependencies
- Local run: backend and frontend can be started separately during development
- Production: backend serves the compiled frontend bundle

## Testing & Validation

- Validate mobile layout manually on small screens
- Verify order lifecycle transitions and report calculations
- Confirm backend API returns correct order summaries
