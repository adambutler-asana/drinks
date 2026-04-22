# PRD: Cocktail Menu & Ordering App

## Overview

A mobile-first web app that replaces an existing static cocktail menu site (adambutler.me/cocktails) with an interactive ordering system. Guests at a party pull up the app on their phones, browse the menu for that event, and submit drink orders. The host (Adam) sees incoming orders on a private queue, taps to view recipes, and marks orders as complete. The entire experience is optimized exclusively for mobile — no desktop layout needed.

The existing site has a strong visual identity: bold typographic sections per spirit category (Whiskey, Gin, Rum, Tequila, Spritz, Mocktails), each with distinct background colors, display fonts, and a monospace body font. The new app should preserve and evolve this aesthetic — hip, typographic, modern — while adding app-like interactivity (smooth transitions, tap targets, bottom navigation, etc.).

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | **React** (via Vite) | Lightweight, component-driven, good for the multi-view app-like structure. Vite for fast builds and simple config. |
| Styling | **CSS Modules** or **Tailwind CSS** | Either works. The existing site uses custom fonts and per-section color palettes that should be preserved, so a utility-first or modular CSS approach keeps things clean. |
| Backend / Database | **Firebase** (Firestore + Realtime listeners) | Free tier handles this scale easily. Firestore provides real-time sync out of the box — when a guest places an order, the host's queue updates instantly, and vice versa. No server to manage. |
| Hosting | **Existing domain** (adambutler.me/cocktails) | Deploy the built React app as static files to the existing hosting setup. Firebase is only used as a database, not for hosting. |
| Routing | **React Router** (hash or browser history) | Multiple views (event select, menu, order queue, admin) need client-side routing. |

No other backend is needed. Firebase Firestore handles all data persistence and real-time sync. The app is a static SPA that talks directly to Firebase from the browser.

---

## Data Model (Firestore)

### `recipes` collection
The global, canonical recipe library. Every drink lives here exactly once. Recipes are NOT duplicated per event — events reference them by ID.

```
recipes/{recipeId}
{
  id: string,
  name: string,                    // "Old Fashioned"
  emoji: string,                   // "🥃"
  category: string,                // "Whiskey" | "Gin" | "Rum" | "Tequila" | "Spritz" | "Mocktails"
  shortDescription: string,        // "Bourbon, bitters, brown sugar, orange peel, large cube"
  ingredients: [
    { amount: "2 oz", item: "Maker's Mark bourbon" },
    { amount: "4 dashes", item: "Angostura bitters" },
    ...
  ],
  steps: [
    "Pour bitters and simple syrup in old fashioned glass",
    "Place large ice cube in glass",
    ...
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `events` collection
Each party/gathering is an event with a curated subset of the recipe library.

```
events/{eventId}
{
  id: string,
  name: string,                    // "Summer BBQ 2026"
  date: timestamp,                 // Event date (for display/sorting)
  isActive: boolean,               // Whether this event is currently live for ordering
  availableDrinks: [recipeId, ...], // Array of recipe IDs available at this event
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `orders` collection
Every drink order placed by a guest.

```
orders/{orderId}
{
  id: string,
  eventId: string | null,          // Which event this order belongs to (null if no event)
  guestName: string,               // Required — the guest's name
  items: [
    { recipeId: string, name: string, quantity: number },
    ...
  ],
  status: "pending" | "completed",
  createdAt: timestamp,
  completedAt: timestamp | null
}
```

### `config` document
App-level configuration.

```
config/settings
{
  adminPin: string,                // Hashed PIN for admin access
  defaultMenuMode: "full" | "event" // What to show when no event is active
}
```

---

## App Structure & Views

The app has two distinct "modes" sharing the same codebase and database:

1. **Guest mode** — The public-facing menu and ordering experience. This is what party guests see.
2. **Admin mode** — The host's private dashboard for managing orders, events, recipes, and the menu. Protected by a PIN.

### URL structure

```
/                         → Event selector (or full menu if no events active)
/event/:eventId           → Menu for a specific event
/menu                     → Full menu (all drinks, used when no events are active)
/order                    → Order builder / cart
/queue                    → Guest-facing read-only order queue
/admin                    → Admin PIN entry
/admin/orders             → Admin order queue (with complete/archive actions)
/admin/recipes            → Recipe library management
/admin/recipes/:recipeId  → Individual recipe detail view
/admin/events             → Event management
/admin/events/:eventId    → Edit a specific event's drink selection
```

---

## View-by-View Specification

### 1. Event Selector (`/`)

The landing page. Behavior depends on what events exist:

**If one or more events with `isActive: true` exist:**
- Show a list of active events, sorted by date (newest first)
- Each event is a tappable card showing the event name and date
- Tapping an event navigates to `/event/:eventId`
- If there is only one active event, **auto-redirect** to that event's menu (skip this screen)

**If no active events exist:**
- Auto-redirect to `/menu` (full menu with all drinks)

**Design notes:**
- Keep it minimal. This is a quick selection screen, not a homepage.
- Dark background, large type, event cards as full-width tappable blocks.

### 2. Event Menu (`/event/:eventId`) and Full Menu (`/menu`)

These two views are almost identical — the only difference is which drinks are shown (filtered by event vs. all drinks).

**Layout:**
- Drinks are grouped by category (Whiskey, Gin, Rum, Tequila, Spritz, Mocktails) in vertical sections
- Each section has the same visual treatment as the existing site: distinct background color, display font for the category header, monospace for descriptions
- Each drink shows its name, emoji, and short ingredient description
- Each drink has a tappable "+" button (or tap the whole card) to add it to the current order

**Ordering interaction:**
- Tapping "+" on a drink adds 1 to the order. A small badge/counter appears on the drink showing quantity.
- Tapping the badge lets the guest adjust quantity (increment/decrement) or remove
- A persistent bottom bar shows the current order summary: "3 drinks" with a "Place Order" button
- The bottom bar only appears when at least 1 drink is in the order
- Tapping "Place Order" navigates to the order confirmation view

**Bottom navigation:**
- Two tabs at the very bottom: **Menu** (current view) and **Queue** (navigates to `/queue`)
- Menu tab is highlighted when on this view

**Design notes — preserving the existing aesthetic:**
The current site uses these visual characteristics per section. Preserve them or evolve them while keeping the same spirit:

| Category | Background | Header Font | Header Color | Text Color |
|---|---|---|---|---|
| Whiskey | #DFC39D | Tungsten Medium | #CA4321 | #474238 |
| Gin | #AED1BC | Marmalede | #F05959 | #153B26 |
| Rum | #64754A | Mrs Sheppards | #F47F7F | #FFE7C6 |
| Tequila | #1C1C1C | Hellenic Wide | #CFA16C | #808C73 |
| Spritz | #FDF4E2 | Neutra Demi | #FD6615 | #2D2A22 |
| Mocktails | #FFD7CC | SignPainter Housebrush | #FF8A47 | #286645 |

Body text throughout: SF Mono or a fallback monospace.

Custom font files (.woff) are currently hosted at adambutler.me/fonts/. The new app should reference these same font files (or bundle them).

### 3. Order Confirmation (`/order`)

After tapping "Place Order" from the menu:

- Show a summary of the selected drinks (name, quantity, with ability to adjust)
- A required text input for the guest's name (with a clear label like "Your name")
- A "Submit Order" button (disabled until a name is entered)
- On submit:
  - Write the order to Firestore with status "pending"
  - Show a brief confirmation animation/message ("Order placed!")
  - Auto-navigate to the queue view (`/queue`) so the guest can watch their order's progress
  - Clear the local order/cart state

### 4. Guest Queue (`/queue`)

A read-only, real-time view of the current order queue. This is what guests look at to see where their order stands.

**Layout:**
- Title: "Order Queue" or "Now Serving"
- A vertically scrolling list of all **pending** orders, sorted by creation time (oldest first = being made next)
- Each order card shows:
  - Guest name
  - List of drinks ordered (with quantities)
  - Position in queue (e.g., "#1", "#2", "#3")
- The list updates in real-time via Firestore listener — when the host completes an order, it disappears from this view automatically
- If the queue is empty, show a friendly message like "No orders in the queue — go order something!"

**Bottom navigation:**
- Same two tabs: **Menu** and **Queue**
- Queue tab is highlighted when on this view

**Design notes:**
- Keep it simple and glanceable. Large text, clear position numbers.
- Subtle animation when orders are removed (completed) — e.g., a slide-out.
- Consider highlighting the guest's own order if their name matches (using the name they entered when ordering, stored in local state or sessionStorage).

### 5. Admin PIN Entry (`/admin`)

- A simple numeric PIN input screen
- Title: "Admin Access" or similar
- PIN input field (can be a standard text input with type="password", or a PIN pad UI)
- On correct PIN, set an admin session flag (in memory or sessionStorage) and redirect to `/admin/orders`
- On incorrect PIN, show an error message
- The PIN is stored hashed in the Firestore `config/settings` document

**Note:** This is party-level security. The PIN just prevents random guests from stumbling into the admin view. It does not need to be cryptographically robust.

### 6. Admin Order Queue (`/admin/orders`)

The host's primary working view. This is where Adam spends most of his time during a party.

**Layout:**
- Title: "Orders"
- A vertically scrolling list of all **pending** orders, sorted by creation time (oldest first)
- Each order card shows:
  - Guest name (large, prominent)
  - List of drinks ordered (each drink name is **tappable** — see recipe interaction below)
  - Timestamp (relative, e.g., "2 min ago")
  - A large, easy-to-tap "Complete" button (checkmark or "Done")

**Recipe interaction (critical UX):**
When the host taps a drink name within an order, it should navigate to the recipe detail view (`/admin/recipes/:recipeId`) for that specific drink. The back button or a swipe-back gesture should return to the order queue, exactly where the host left off. This back-and-forth between orders and recipes is the primary interaction loop and must be fast and fluid.

Consider using a slide-over or modal for the recipe view rather than a full navigation, so the host doesn't lose their place in the queue. The key is minimal friction: tap a drink name → see the full recipe → dismiss → back to the order.

**Completing an order:**
- Tapping "Complete" moves the order from pending to completed:
  - Sets `status: "completed"` and `completedAt: timestamp` in Firestore
  - The order slides out of the pending list with a brief animation
  - The guest-facing queue (`/queue`) updates in real-time to reflect this

**Admin bottom navigation:**
- Four tabs: **Orders** | **Archive** | **Recipes** | **Events**
- Orders tab is highlighted when on this view

### 7. Admin Archive (`/admin/archive`)

A log of all completed orders.

- Shows all orders with `status: "completed"`, sorted by `completedAt` (most recent first)
- Each entry shows: guest name, drinks ordered, and the completion timestamp
- This is read-only — no actions needed
- Useful for end-of-night stats (how many drinks you made, what was popular, etc.)
- Consider adding a simple summary at the top: total drinks served, most popular drink, total orders

### 8. Admin Recipe Library (`/admin/recipes`)

Full CRUD management for the recipe collection.

**List view:**
- All recipes grouped by category (same grouping as the menu)
- Each recipe shows: name, emoji, short description
- Tapping a recipe navigates to the detail/edit view
- A "+" floating action button to add a new recipe

**Detail/Edit view (`/admin/recipes/:recipeId`):**
- Full recipe display: name, emoji, category, short description, ingredients list, steps
- An "Edit" button that switches to edit mode (inline editing, or a form)
- In edit mode, all fields are editable:
  - Name, emoji, category (dropdown), short description
  - Ingredients: each is an amount + item pair. Add/remove/reorder.
  - Steps: ordered list. Add/remove/reorder.
- "Save" and "Cancel" buttons
- "Delete" button (with confirmation dialog)

**Adding a new recipe:**
- Same form as edit mode but blank
- Category defaults to the first option or is required

**Important:** Editing a recipe here updates it globally. Any event menu that includes this recipe will automatically reflect the changes (since events reference recipes by ID, not by copy).

### 9. Admin Event Management (`/admin/events`)

CRUD for events and their drink selections.

**List view:**
- All events sorted by date (newest first)
- Each event shows: name, date, active/inactive badge, number of drinks on the menu
- Tapping an event opens the edit view
- A "+" floating action button to create a new event

**Create/Edit view (`/admin/events/:eventId`):**
- Fields: event name, date picker, active toggle
- **Drink selector:** A checklist of all recipes (grouped by category). The host checks/unchecks drinks to include them on this event's menu.
  - "Select All" and "Deselect All" per category for convenience
  - Show a count of selected drinks
- "Save" and "Cancel" buttons
- "Delete" button (with confirmation — warn if the event has pending orders)

**Active toggle behavior:**
- Multiple events can be active simultaneously (e.g., a multi-day event)
- Setting an event to active makes it appear on the guest-facing event selector
- Setting it to inactive hides it from guests but preserves all its data and order history

---

## Data Seeding

The app should include a seed script or a first-run setup that populates the Firestore `recipes` collection with all 28 cocktails from the existing menu. Here is the full recipe data to seed from (currently stored in the markdown file "Adam's cocktail menu.md"):

### Whiskey
1. **Old Fashioned** 🥃 — Bourbon, bitters, brown sugar, orange peel, large cube
2. **Whiskey Sour** 🍋 — Bourbon, lemon, simple syrup, egg whites, bitters
3. **Paper Plane** ✈️ — Bourbon, aperol, nonino, lemon
4. **Boulevardier** 🥃 — Rye, sweet vermouth, campari, orange peel, large cube
5. **Manhattan** 🥃 — Rye, sweet vermouth, bitters, cherries
6. **Black Manhattan** 🥃 — Rye, averna, bitters, cherries

### Gin
7. **Negroni** 🥃 — Gin, campari, sweet vermouth, orange peel, large cube
8. **Tangerine Dream** 🍊 — Gin, tangerine, lime, simple syrup, egg whites, nutmeg
9. **Clover Club** 🍓 — Gin, raspberries, dry vermouth, lemon, simple syrup, egg whites
10. **Gin Fizz** ✨ — Gin, lemon, simple syrup, egg whites, club soda
11. **Corpse Reviver No. 2** 🍸 — Gin, lillet blanc, lemon, cointreau, absinthe
12. **Gimlet** 🍸 — Gin, lime, simple syrup, lime wheel

### Rum
13. **Classic Daiquiri** 🍸 — White rum, lime, simple syrup, lime wheel
14. **Rum Old Fashioned** 🥃 — Aged rum, allspice, demerara syrup, bitters, lemon peel, large cube
15. **Jungle Bird** 🦜 — Jamaican rum, campari, lime, simple syrup, pineapple
16. **Planter's Punch** 🍹 — Jamaican rum, lime, allspice, demerara syrup, bitters, mint sprig
17. **Mai Tai** 🍹 — Jamaican rum, lime, orange curaçao, orgeat, simple syrup, mint sprig
18. **El Presidente** 🥃 — Aged rum, lillet blanc, orange curaçao, grenadine
19. **Koana Puffer** 🐡 — Gin, aged rum, pineapple, lemon, orgeat, simple syrup, orange curaçao
20. **Mojito** 🌴 — White rum, lime, fresh mint, simple syrup, club soda, lime wheel
21. **Cuban Pool Boy** 🌴 — Aged rum, lime, champagne, simple syrup, egg whites, fresh mint, bitters, nutmeg, large cube

### Tequila
22. **Margarita** 🌵 — Tequila, lime, cointreau, agave nectar, lime wheel
23. **Tequila Sour** 🌵 — Reposado, lime, simple syrup, egg whites, bitters
24. **Paloma** 🍊 — Tequila, grapefruit, lime, simple syrup, club soda

### Spritz
25. **Aperol Spritz** 🍷 — Champagne, aperol, club soda, orange slice
26. **Americano** 🍷 — Sweet vermouth, campari, club soda, orange slice
27. **Wine Spritzer** 🍷 — Pinot noir, aperol, lime, club soda, orange slice

### Mocktails
28. **Mock-scow Mule** — Ginger beer, lime, simple syrup, mint, club soda, lime wheel
29. **Strawberry Faux-jito** — Sprite, strawberries, mint, lime, lime wheel

The full detailed recipes (ingredients with measurements and step-by-step instructions) are in the file `Adam's cocktail menu.md` in the project folder. The seed script should parse this file or the data should be hardcoded from it.

**Note:** The existing HTML menu also lists a "Campari Spritz" (Prosecco, campari, club soda, orange slice) that does not have a detailed recipe in the markdown file. Include it in the seed data with just the short description and no detailed recipe steps — the host can fill those in later via the admin recipe editor.

---

## Real-Time Behavior

Firebase Firestore real-time listeners are the backbone of the multi-device sync. Here's what should be live:

| View | Listens to | Updates when... |
|---|---|---|
| Guest queue (`/queue`) | `orders` where `status == "pending"` | New order placed by any guest, or order completed by host |
| Admin order queue (`/admin/orders`) | `orders` where `status == "pending"` | New order placed by any guest |
| Event menu (`/event/:eventId`) | `events/{eventId}` | Host changes which drinks are available (optional, nice-to-have) |

Firestore's `onSnapshot` provides this out of the box. No polling needed.

---

## Admin PIN Implementation

Keep it simple:

1. On first launch (or via a setup flow), the host sets a PIN via the admin interface
2. The PIN is stored in Firestore at `config/settings.adminPin` as a basic hash (SHA-256 is fine — this is party security, not banking)
3. When accessing any `/admin/*` route, check if the session has been authenticated
4. If not, redirect to `/admin` (the PIN entry screen)
5. On correct PIN entry, store an auth flag in sessionStorage so the host doesn't have to re-enter it during the same browser session
6. There is no logout — closing the browser clears the session

---

## Font & Asset Requirements

The existing site uses custom fonts hosted at `adambutler.me/fonts/`. The new app should use these same fonts. Here are the font files referenced in the current CSS:

- `DINCondensed-Regular.woff` — Used for h1/h2 base heading styles
- `Marmalede.woff` — Gin section header
- `Mrs-Sheppards.woff` — Rum section header
- `Futura-Medium.woff` — Referenced but not actively used in current CSS
- `neutra-demi-webfont.woff` — Spritz section header
- `SF-Mono-Regular.woff` — Body/description text
- `Optima-ExtraBlack.woff` — Drink name headings (h2)
- `Hellenic-Wide.woff` — Tequila section header
- `SignPainter-Housebrush.woff` — Mocktails section header
- `Tungsten-Medium.woff` — Whiskey section header

These should either be bundled with the app or referenced from the existing `/fonts/` path on the server.

---

## Mobile-Only Design Constraints

This app will ONLY be used on mobile phones. Design decisions should reflect this:

- **No desktop layout.** Don't waste time on responsive breakpoints for large screens. Design for 375px–430px width (iPhone range) as the primary target.
- **Large tap targets.** All buttons and interactive elements should be at least 44px tall. The "Complete" button on orders should be even larger.
- **Bottom navigation.** Primary nav lives at the bottom of the screen, within thumb reach.
- **No hover states.** Everything is tap-based.
- **Minimal typing.** The only text input in the guest flow is the name field. Use large, clear input fields.
- **Scroll-based navigation.** The menu should be a single scrollable page with sections, not a tabbed interface.
- **Safe area insets.** Account for the iPhone notch and home indicator with proper `env(safe-area-inset-*)` padding.
- **Viewport height.** Use `dvh` (dynamic viewport height) units to properly handle mobile browser chrome.
- **Touch gestures.** Consider swipe-back for navigating from a recipe back to the order queue (the primary host interaction loop).

---

## Interaction Flows

### Guest Flow
```
1. Open app → Event selector (or auto-redirect to menu)
2. Browse menu → Tap "+" on drinks to add to order
3. Tap "Place Order" in bottom bar
4. Enter name → Tap "Submit Order"
5. See confirmation → Auto-redirect to queue
6. Watch queue in real-time until order is completed
7. (Optional) Go back to menu to order more
```

### Host Flow (during a party)
```
1. Open /admin → Enter PIN
2. Land on order queue
3. See new order appear in real-time
4. Tap a drink name to see its recipe → Read recipe → Swipe/tap back
5. Make the drinks
6. Tap "Complete" on the order
7. Repeat
```

### Host Flow (setup / between parties)
```
1. Open /admin → Enter PIN
2. Go to Recipes tab → Add/edit/remove recipes
3. Go to Events tab → Create new event
4. Select which drinks are available for the event
5. Toggle event to "active"
6. Share the app URL with guests
```

---

## Firebase Setup Notes

For the builder (Claude Code), here's how to set up Firebase:

1. Create a Firebase project (free Spark plan is sufficient)
2. Enable Firestore Database in the Firebase console
3. Set Firestore security rules to allow reads from anyone and writes from anyone (this is a party app with PIN-level security, not a production system with user auth):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read anything (guests need to see the menu and queue)
    match /{document=**} {
      allow read: true;
    }
    // Anyone can create orders (guests placing orders)
    match /orders/{orderId} {
      allow create: true;
    }
    // Only allow writes to admin-managed collections if the request
    // includes the admin PIN hash as a custom field (lightweight auth)
    // Alternatively, just allow all writes since this is PIN-protected at the app level
    match /{document=**} {
      allow write: true;
    }
  }
}
```

4. Install the Firebase JS SDK (`firebase` npm package)
5. Initialize with the project config (API key, project ID, etc.)
6. The config values should be stored in environment variables or a `.env` file, not hardcoded

---

## Out of Scope (for initial build)

These features are NOT part of v1 but could be added later:

- Push notifications when an order is ready
- Payment integration
- Drink ratings or favorites
- Guest accounts / order history per guest
- Analytics dashboard (beyond the simple archive summary)
- Desktop-responsive layout
- Offline support / service worker
- Image uploads for drinks (all drinks are text-only for now)
- Multiple simultaneous bartenders / order assignment

---

## Summary of Deliverables

1. A React (Vite) app with all views described above
2. Firebase Firestore integration with real-time listeners
3. Seed data for all 29 cocktail recipes from the existing menu
4. Custom fonts integrated from the existing site
5. Mobile-only CSS with the existing color palette and typographic system preserved
6. PIN-based admin authentication
7. Clean, readable code — this is a personal project that the owner may want to modify directly

The app should be deployable as a static build (`npm run build` → deploy the `dist/` folder) to any static hosting, with Firebase providing the backend.
