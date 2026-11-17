[README.en.md](https://github.com/user-attachments/files/34973796/README.en.md)
# FreshMarket — Online Grocery Store

A modern, mobile-first e-commerce application built with **React (Vite) + Tailwind CSS + Lucide React + Framer Motion**.
The storefront defaults to **Uzbek**, with full **Russian** and **English** support; prices are shown in **so'm**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

Requirements: Node.js 18+ and npm.

## Demo access

| Area | Path | Password |
| --- | --- | --- |
| Storefront | `/` | — |
| Admin panel | `/#/admin` (or `/admin`) | `admin123` |

The **Admin Panel** button in the header also opens the dashboard. The session lasts until the browser is closed.

## Languages (UZ / RU / EN)

- Switch languages from the `UZ | RU | EN` control in the header, or the globe button on mobile.
- The choice is stored in `freshmarket.lang.v1` and also applies to the admin panel.
- UI copy, categories, product names/descriptions, units and price formatting (`so'm` / `сум` / `UZS`) are localised.
- Free text entered by an admin (tagline, announcement, custom product names) is **not** machine-translated — it is shown exactly as typed.

## Storefront

- Sticky header with live search (⌘/Ctrl + K), delivery badge, cart counter, language switcher and admin shortcut.
- Auto-rotating promo slider (3 slides) plus a benefits strip.
- Category pills with horizontal scrolling on mobile and a wrapping row on desktop.
- Product cards: discount badge (`-15%`), `Yangi` tag, rating, old price, and a `Savatga +` button that morphs into a `[- 1 +]` stepper.
- Quick-view modal with description, nutrition per 100 g and stock status.
- Cart drawer persisted in `localStorage`: change quantity, remove, clear, free-delivery progress.
- Checkout: validation, `+998` phone mask, Cash / Click / Payme, order receipt and order ID.
- Telegram Bot API integration (`src/lib/telegram.js`).
- Optional announcement banner and a "store closed" mode that blocks checkout.

## Admin panel

- Password-protected dashboard with a responsive sidebar and mobile drawer.
- Overview: 4 KPIs (revenue, new orders, product count, average order), recent orders, order-status breakdown, catalog mix and inventory list.
- Orders: status filters, search, colour-coded status select (New → Delivered / Cancelled), detailed modal.
  Edit customer name/phone/address/comment, payment method and item quantities, or delete an order —
  subtotal, delivery fee and total are recalculated automatically.
- Products: search, category/stock filters, create/edit/delete, stock toggle, rating and review count, image preview.
- Settings (fully editable):
  - Store name, tagline, phone, working hours, city, address, Telegram/Instagram, support note.
  - Delivery fee, free-delivery threshold, delivery-time text.
  - Store open/closed state and the announcement shown above the storefront.
  - Admin password change.
  - Telegram status, demo data and settings reset.
  Changes apply to the storefront immediately; checkout is disabled while the store is closed.

## Mobile experience

- Two-column product grid (3 at ≥640 px, 4–5 at ≥1024 px).
- Sticky bottom navigation plus a floating cart bar.
- Drawers and modals become bottom sheets on phones.
- `env(safe-area-inset-bottom)` for iPhone notch/home indicator.
- Touch-friendly 36–44 px controls and scroll-snap category rows.
- No horizontal scrolling from 320 px to 1440 px.

## Architecture

```
src/
├── components/
│   ├── store/     # Header, Hero, Catalog, ProductCard, CartDrawer, Checkout, QuickView, Footer, MobileNav
│   ├── admin/     # AdminApp, AdminLogin, Dashboard, OrdersManager, ProductsManager, ProductFormModal, AdminSettings
│   └── ui/        # Modal, QuantityStepper, SmartImage, Toasts, LanguageSwitcher
├── store/StoreContext.jsx   # single source of truth: products, cart, orders, settings, UI
├── data/products.js         # catalog + demo orders
├── data/defaultSettings.js  # editable store settings
├── i18n/                    # UZ/RU/EN: context, dictionary, product translations
├── lib/                     # utils (formatting, statuses), telegram, adminAuth
├── hooks/useHashRoute.js    # #/ and #/admin routing
└── config/brand.js          # brand defaults, admin password
```

### Data flow

`StoreContext` is the single source of truth. Products, cart, orders and store settings are persisted in
`localStorage` (`freshmarket.products.v1`, `freshmarket.cart.v1`, `freshmarket.orders.v1`,
`freshmarket.settings.v1`) and synchronised across tabs through the `storage` event.
Any change made in the admin panel is reflected on the storefront immediately.

The admin password is stored under `freshmarket.admin.password.v1`; the initial value is `admin123`
from `src/config/brand.js`. It can be changed in **Settings → Security**.

## Telegram setup

```bash
cp .env.example .env
# VITE_TELEGRAM_BOT_TOKEN=123456:ABC...
# VITE_TELEGRAM_CHAT_ID=-1001234567890
```

Without a token, orders are not sent (demo mode) — the receipt shows this state and the order is still
saved in the admin panel. Message formatting lives in `buildOrderMessage()`.

Environment variables are baked in at build time, so redeploy after changing them.

## Deployment

1. `npm run build`
2. Upload the `dist` folder to Netlify (or Vercel / Cloudflare Pages).
   - Build command: `npm run build`
   - Publish directory: `dist`
3. The app uses hash routing (`/#/admin`), so no extra SPA rewrite rules are required.

## Notes

- Images are served from the Unsplash CDN (each URL verified with HTTP 200); `SmartImage` shows a skeleton and a fallback when offline.
- Authentication is browser-only for demo purposes. Use server-side auth/JWT in production.
- Order IDs use the `FM-XXXX` format.
- Data is stored per browser. To share orders and settings across devices, connect a backend (Supabase, Firebase or your own API).
