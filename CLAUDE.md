# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cocktail ordering app for hosting cocktail parties. Guests browse a menu, add drinks, and submit orders. The host (admin) sees incoming orders in real-time and marks them complete. Built as a mobile-first single-page app deployed to a `/drinks/` subdirectory.

The app source lives in `app/`. GitHub repo: https://github.com/adambutler-asana/drinks

## Commands

All commands run from the `app/` directory:

- `npm run dev` — Start dev server (serves at http://localhost:5173/drinks/)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build
- `npm run lint` — ESLint check

## Architecture

**Stack:** React 19 + Vite 5 + Firebase Firestore + React Router 7. Plain CSS (no framework). Mobile-only design (no desktop breakpoints).

**Base path:** All routes are under `/drinks/` — set via `vite.config.js` `base` and `BrowserRouter basename`.

### Route Structure

Guest routes (`/`, `/menu`, `/event/:eventId`, `/order`, `/queue`) are open. Admin routes (`/admin/*`) are protected by `AdminRoute`, which checks `AdminContext` auth state backed by sessionStorage.

- `/` — Event selector or redirect
- `/menu` and `/event/:eventId` — Both render `Menu.jsx` (full menu vs event-filtered)
- `/order` — Cart review with name entry
- `/queue` — Real-time order feed for guests (pending + completed)
- `/admin` — PIN entry (SHA-256 hash compared against Firestore `config/settings`)
- `/admin/orders` — Live order queue with complete action
- `/admin/archive` — Completed order history with stats
- `/admin/recipes` and `/admin/recipes/:recipeId` — Recipe CRUD with drag-to-reorder
- `/admin/events` and `/admin/events/:eventId` — Event CRUD with drink selection

### State Management

Two React contexts wrap the app in `App.jsx`:

- **OrderContext** — Guest cart (useReducer). Holds `items[]` with `{recipeId, name, quantity}` and `eventId`. Provides `addItem`, `removeItem`, `setQuantity`, `clearOrder`, `getItemQuantity`, `totalItems`.
- **AdminContext** — Auth flag synced to sessionStorage.

### Firebase / Firestore

All Firebase operations are in `app/src/services/firebase.js`. Four collections:

- **`recipes`** — Drink definitions with `name`, `category`, `ingredients[]`, `steps[]`, `sortOrder`. Ordered by category, then `sortOrder` within category (client-side sort to avoid composite indexes).
- **`orders`** — Guest orders with `guestName`, `items[]`, `status` (pending/completed), `createdAt`, `completedAt`, optional `eventId`.
- **`events`** — Party events with `name`, `date`, `isActive`, `recipeIds[]`.
- **`config/settings`** — Single doc holding `adminPin` hash.

Real-time data uses `onSnapshot` subscriptions (functions prefixed `subscribe*`). All filtering/sorting is done client-side to avoid needing Firestore composite indexes.

### Styling

Single CSS file at `app/src/styles/index.css`. Key patterns:

- Six drink categories each have distinct background colors, title fonts, and text colors (e.g., `.category-whiskey`, `.category-gin`). Each sets a `--section-bg` CSS custom property used by child components.
- Custom fonts loaded from `/public/fonts/` via `@font-face`: DIN (headings), SF Mono (body/mono), Optima ExtraBlack (names), plus category-specific display fonts.
- Safe area insets and `dvh` units for mobile viewport handling.

### Seed Data

`app/src/services/seedData.js` contains 29 canonical recipes across 6 categories with `sortOrder` fields. `seedRecipes()` populates an empty database; called from admin UI when no recipes exist.

## Environment Variables

Required in `app/.env` (see `app/.env.example`):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Deployment

Build outputs to `dist/`. Deploy as static files to any host, served from the `/drinks/` path. No server-side rendering — Firestore handles all backend needs.
