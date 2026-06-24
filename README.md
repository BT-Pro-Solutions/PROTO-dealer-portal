# PROTO Dealer Portal

A three-tier dealer portal system for truck upfitters and their dealership partners.

## Current scope: Dealership tier

Dealers log in to browse vehicles from their upfitter, build a selection list for a customer, and submit a batch quote request.

### Features

- Browse vehicle inventory with search and filters (make, color, truck type, rear wheel, drive)
- Select multiple vehicles for a quote request
- Responsive layout with collapsible filters on mobile
- Dummy data layer ready to swap for real API calls

### Tech stack

- Vue 3 (Composition API)
- Vite
- Vanilla CSS with custom properties (no Tailwind)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/
├── data/
│   ├── dealer.js      # Session context — replace fetchDealerSession()
│   └── vehicles.js    # Catalog & quote API — replace fetchVehicles(), submitQuoteRequest()
├── composables/
│   ├── useVehicleFilters.js
│   └── useVehicleSelection.js
├── components/
│   ├── AppHeader.vue
│   ├── SidebarFilters.vue
│   ├── VehicleCard.vue
│   └── VehicleGrid.vue
└── styles/
    ├── variables.css  # Design tokens
    └── base.css
```

## Connecting real data

Replace the async functions in `src/data/`:

- `fetchDealerSession()` — dealer user and dealership info
- `fetchVehicles()` — vehicle catalog from the upfitter
- `submitQuoteRequest(vehicleIds)` — POST selected vehicle IDs for quoting

The rest of the app consumes these through composables and does not need changes.

## Build

```bash
npm run build
npm run preview
```
