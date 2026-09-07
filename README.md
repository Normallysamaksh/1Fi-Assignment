# 1Fi Marketplace

A responsive React + TypeScript implementation of the 1Fi Marketplace assignment. The purple palette, Shop banner, pill tabs, rounded cards and floating mobile navigation have been derived from existing ui. This is a standalone web implementation designed for later integration as only the marketplace section was asked to be designed.

## Run locally

Requires Node.js 22.13 or later and npm.

```sh
npm ci
npm run dev
```

Open the address printed by the server (normally http://localhost:3000).

```sh
npm test
npm run lint
npm run build
```

The production build is a static export in `dist/client`. It can be hosted on a static web server. No secrets or environment variables are needed. The included Sites manifest supports private preview hosting.

## Implemented experience

- Shop tabs: Top Brands, Nearby Stores, and 1Fi Marketplace. The first two intentionally have blank content, as allowed by the brief.
- Six products across smartphones, laptops, audio and wearables, with local product images, pricing, discounts and approximate starting EMIs.
- Combined text search and category filtering, with clear/reset controls and a no-results state.
- Product details, an enlarged image view, specifications, colour and selectable variants. Unavailable variants are visibly disabled.
- 3, 6, 12 and 24-month no-cost EMI options. Changing the variant recalculates the selected plan.
- Exact payment breakdown, review dialog, confirmation state, and navigation back to the catalogue.
- Loading, request error/retry, missing-product and image-fallback states.
- Responsive desktop and mobile layouts, keyboard-operable tabs/radios/dialogs, visible focus, reduced-motion handling and screen-reader labels.

Home, EMI Dues, Limit and Profile are context-only navigation items; their controls are disabled because those screens are outside this assignment.

## Structure and decisions

| Area                  | Location                         | Responsibility                                                          |
| --------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| App entry             | `app/page.tsx`, `app/layout.tsx` | Page and metadata                                                       |
| Design system         | `app/globals.css`                | Shared tokens and responsive component styles                           |
| Shop/catalogue        | `components/marketplace.tsx`     | Tabs, search, filtering and product cards                               |
| Product flow          | `components/product-detail.tsx`  | Variants, EMI selection and review/confirmation                         |
| Images                | `components/product-image.tsx`   | Local images and failure fallback                                       |
| Routing               | `hooks/use-marketplace-route.ts` | URL-backed product, variant and plan state; browser back/forward        |
| Data contracts        | `lib/types.ts`                   | Product, variant and EMI types                                          |
| Data and calculations | `lib/marketplace.ts`             | Async catalogue service, validation and integer-paise EMI calculations  |
| Mock API response     | `public/data/catalog.json`       | Product/EMI data outside UI components                                  |
| Tests                 | `tests/marketplace.test.mjs`     | Pricing, rounding, availability, assets and fetch failures/cancellation |

The UI uses React and Vinext's Next-compatible app structure, with the generated Base UI/Shadcn primitives for accessible tabs, radios and dialogs. No global state package is needed for this scope. Product, variant and plan IDs live in the URL, so a selection can be refreshed or revisited through browser history. Search and category state remain in memory during in-app navigation.

`fetchCatalog()` fetches a same-origin JSON endpoint. Replace this service with a real catalogue API while retaining the typed response. For a production checkout, replace the simulated confirmation in `ProductDetail` with a server-authoritative quote/eligibility/order endpoint that revalidates prices, stock and terms. No order, charge, investment pledge or loan is created by this demo. The confirmation has a short simulated delay solely to demonstrate its pending state.

EMI calculations use integer paise. The final instalment absorbs the rounding remainder so instalments sum exactly to the total. Catalogue-card amounts are rounded rupee estimates; the product and review screens display exact amounts. The mock plans all have zero interest and fees; any future nonzero interest field represents a flat percentage over the term, not an annual reducing-balance APR.

## Validation

Nine automated checks cover all catalogue variants and EMI tenures, exact rounding, changing variants, unavailable/unknown selections, invalid financial inputs, local assets, successful data loading, retryable data errors and request cancellation. The app also passes TypeScript checking and linting; generated vendor primitives are excluded from application lint rules.

An optional feature-detected WebMCP surface exposes `get_marketplace_products` and `stage_emi_plan`. Staging uses the same selection validation and URL navigation as the UI and does not confirm or transact. A supported live WebMCP validation context was not available; this optional integration is not claimed as verified.

The generated toolchain retains upstream audit findings in transitive build dependencies with no compatible fix reported by npm. React was updated to 19.2.8 and Vite to 8.2.2. Deployment contains static HTML, JS, CSS and catalogue assets only; it does not deploy the development server or server-function runtime. Review/update the toolchain before extending this into a production backend.

## Assets and sample data

All product prices, availability, badges and EMI plans are illustrative assignment data, not live offers. One supplied Shop screenshot is used as a clipped visual source for the banner; its personal/account sections are not part of the image.

Product images were downloaded into `public/products` so the demo does not rely on image hotlinking. Source pages are recorded in each product's `imageSource` field:

- iPhone 16: Trikart
- MacBook Air M3: Caretek / Etilize
- Sony WH-1000XM5: Citrus
- Apple Watch Series 10: Optus
- AirPods Pro 2: incrediDeals
- Samsung Galaxy S24: Best Buy Canada

Brand names and catalogue photography remain the property of their respective owners. They are used here as assignment references; no commercial redistribution licence is asserted. Replace these with licensed merchant assets for production.

## Suggested evaluation walkthrough

1. Switch between the three Shop tabs, then return to Marketplace.
2. Search for “Apple”, then choose Audio. Clear filters to restore all products.
3. Open iPhone 16. Select 256 GB; verify that 512 GB cannot be selected.
4. Select a 6-month or 24-month EMI and inspect the total and final payment.
5. Choose Proceed with plan, review the chosen variant and price, then confirm the demo selection.
6. Return to the product or continue exploring. Refresh a product URL and use browser back/forward.
7. To exercise request failures, block `/data/catalog.json` in browser developer tools, reload, then unblock it and choose Try again. Network throttling makes the loading skeleton visible.
