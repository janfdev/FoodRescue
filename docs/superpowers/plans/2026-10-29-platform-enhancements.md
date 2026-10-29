# Platform Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 7 platform enhancements and bugfixes covering state persistence, contextual toasts, dedicated KYC & Bag creation pages, Shadcn table transformation, and universal table filtering.

**Architecture:** 
- State management & persistence in `src/services/storeService.ts` with local storage synchronization.
- App Router modular page routing under `/seller/bags/new` and `/admin/mitra/[id]`.
- Shared clean-code helper for contextual toasts in `src/lib/toast.ts`.
- Tabular UI with anti-slop rules (`tabular-nums`, no em-dash, clean action icons) across admin and seller dashboards.

**Tech Stack:** Next.js 16 (App Router + Turbopack), React 19, TypeScript, Lucide Icons, Shadcn UI, react-hot-toast, Bun.

**Spec:** `docs/superpowers/specs/2026-10-29-platform-enhancements-design.md`

## Global Constraints
- Bahasa Indonesia untuk teks antarmuka publik, istilah teknis baku dalam bahasa Inggris.
- Anti-slop R-02: Dilarang menggunakan em-dash (—). Gunakan tanda hubung biasa (-) atau titik dua (:).
- Tabular numbers (`tabular-nums`) untuk nominal mata uang dan ID kuantitatif.

---

### Task 1: Store Logo Persistence & Sidebar Avatar Header
- [ ] Fix `storeService.updateStoreLogo(storeId, logoUrl)` and ensure `updateUserProfile` directly writes `logoUrl` to both `activeStore` and `state.stores` in `localStorage`.
- [ ] Replace `<StoreIcon>` in `src/app/seller/layout.tsx` header with `<Avatar>` resolving `activeStore.logoUrl`.

### Task 2: Contextual Toast Notification System
- [ ] Create `src/lib/toast.ts` wrapping `react-hot-toast` with tailored variants: `toastSuccess`, `toastError`, `toastLoading`.
- [ ] Configure global styles in `src/app/layout.tsx` to support distinct green success, red error, and amber loading states.

### Task 3: Dedicated Create Surprise Bag Page (`/seller/bags/new`)
- [ ] Create `src/app/seller/bags/new/page.tsx` with complete creation form (preset food images, pricing, pickup schedule).
- [ ] Update `/seller/bags/page.tsx`: rename button to "Create Surprise Bag", link to `/seller/bags/new`, and remove legacy `<Dialog>`.

### Task 4: Dedicated Merchant KYC Verification Page (`/admin/mitra/[id]`)
- [ ] Create `src/app/admin/mitra/[id]/page.tsx` displaying full storefront photo, operating hours, coordinates, and bank details.
- [ ] Add clean approval (`CheckCircle`) and rejection (`XCircle`) buttons with contextual toasts.
- [ ] Update `/admin/mitra/page.tsx` table row click to link to the new dedicated verification page.

### Task 5: Financial Payouts & Packaging Logistics Shadcn Data Table
- [ ] Refactor `/admin/keuangan/page.tsx` from card list to Shadcn Data Table with status filters and quick-copy bank button.
- [ ] Maintain the Rescue Box logistics summary table in `/admin/keuangan`.

### Task 6: Universal Table Filtering Toolbar
- [ ] Add searchable and filterable toolbar components across `/admin/mitra`, `/admin/transaksi`, `/admin/audit-logs`, and `/seller/orders`.

### Task 7: Build & E2E Verification
- [ ] Run `bun run build` and `bun run src/test/e2eSimulation.test.ts`.
- [ ] Commit and push to `origin main`.
