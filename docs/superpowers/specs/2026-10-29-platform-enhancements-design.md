# 2026-10-29 FoodRescue Platform Enhancements Specification

**Date:** 2026-10-29  
**Goal:** Enhance FoodRescue (Rerasa) multi-role capabilities across Admin & Seller portals: persistent store logo branding, contextual notifications, dedicated pages for product creation & merchant KYC inspection, Shadcn data table refactor for financial payouts, and universal table filtering.

## 1. Context & User Requirements
1. **Financial & Payout Dashboard (`/admin/keuangan`)**:
   - Refactor payout requests from stacked cards into a structured **Shadcn Data Table**.
   - Keep Rescue Box packaging logistics visible as a dedicated table/section.
2. **Mitra Menunggu KYC (`/admin/mitra`)**:
   - Clicking merchant verification details navigates to a dedicated page (`/admin/mitra/[id]`).
   - Clean verification action buttons with concise anti-slop iconography (`CheckCircle`, `XCircle`).
3. **Universal Table Filtering**:
   - Provide consistent search & status filtering across all table views (`/admin/mitra`, `/admin/keuangan`, `/admin/transaksi`, `/admin/audit-logs`, `/seller/orders`).
4. **Seller Sidebar Header Avatar**:
   - Replace standard orange generic icon with active store/seller avatar (`<Avatar>` resolving `activeStore.logoUrl`).
5. **Create Surprise Bag Page (`/seller/bags/new`)**:
   - Rename action text to "Create Surprise Bag".
   - Replace the dialog modal with a dedicated full page (`/seller/bags/new`) supporting preset photos, pricing, and pickup windows.
6. **Bugfix: Fast Logo Selection Persistence**:
   - Guarantee `logoUrl` selected from ZonaLogo presets or upload persists in `localStorage` under `foodrescue_state_v1` across page reloads.
7. **Contextual Toaster System**:
   - Differentiate toast visuals for success (green check), error (red cross), and loading/upload states (amber/orange spinner).
