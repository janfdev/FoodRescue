# Spec: Comprehensive UI & 3-Role Flow Improvements (FoodRescue)

## Problem Statement

Users across all three roles face UX frictions and workflow gaps that degrade usability:
1. **Buyer**: Route `/tickets` redirects directly to `/history`, obscuring active pickup PINs/QR codes needed at physical store checkout counters; `/checkout` lacks explicit buyer escrow protection guarantees; and post-pickup container compliance feedback is absent.
2. **Seller**: Cashiers during peak closing hours (19:00 - 21:00 WIB) need an uncluttered, touch-friendly POS interface with visual quota badges, instant sold-out triggers, and packaging restock forecasting.
3. **Admin**: The admin dashboard lacks an urgent action center for pending KYC approvals and payout transfers; document verification requires multi-layer modals instead of split-screen inspection; and financial payouts require manual bank account copying.

## Solution

Implement focused UI/UX enhancements across all 3 roles:
- **Buyer**: Standalone `/tickets` (Digital Boarding Pass with dynamic QR, large monospace 4-digit PIN, pickup countdown, direct Google Maps navigation), escrow safety guarantees on `/checkout`, and container compliance rating on `/history`.
- **Seller**: Fullscreen POS Focus mode with touch keypad and audio chime at `/seller`, progressive inventory quota bars with instant sold-out toggles at `/seller/bags`, and B2B packaging stock depletion estimator at `/seller/boxes`.
- **Admin**: Urgent Action Feed widget at `/admin`, split-screen KYC inspection layout at `/admin/mitra`, and 1-click bank account copy with escrow-to-payout liquidity metrics at `/admin/keuangan`.
- **E2E Suite**: Comprehensive test suite covering Super Admin, Seller, and Buyer flows across every sub-menu without 404s, blank screens, or security boundary leaks.

## User Stories

1. As a Buyer, I want a dedicated Digital Boarding Pass page at `/tickets`, so that I can immediately show my 4-digit PIN and QR code to the store cashier without digging through history tabs.
2. As a Buyer, I want a live countdown timer on my pickup ticket, so that I know exactly how much time remains before the store closes.
3. As a Buyer, I want a 1-click Google Maps button on my ticket, so that I can instantly get turn-by-turn directions to the store.
4. As a Buyer, I want an Escrow 100% money-back guarantee badge on `/checkout`, so that I have peace of mind that my money is protected until physical collection.
5. As a Buyer, I want a container compliance prompt on `/history` after completing an order, so that I can verify whether the seller used an official reusable Rescue Box.
6. As a Seller cashier, I want a Fullscreen POS Focus mode at `/seller`, so that I can quickly validate buyer PINs using large touch buttons without distraction during peak hours.
7. As a Seller cashier, I want soft audio chime feedback on PIN verification, so that I get instant auditory confirmation during noisy retail handovers.
8. As a Seller owner, I want visual color-coded quota bars on `/seller/bags`, so that I can immediately spot items running low or mark them sold out with one click.
9. As a Seller owner, I want a smart B2B packaging replenishment calculator on `/seller/boxes`, so that I am alerted before our outlet runs out of official boxes.
10. As a Super Admin, I want an Urgent Action Feed on `/admin`, so that I immediately see pending KYC partner approvals, withdrawal requests, and packaging disputes.
11. As a Super Admin, I want a split-screen KYC reviewer at `/admin/mitra`, so that I can inspect merchant ID cards and storefront photos alongside the approval form.
12. As a Super Admin, I want a 1-click copy button for seller bank account numbers at `/admin/keuangan`, so that I can process payouts quickly without manual transcription errors.
13. As a Super Admin, I want an Escrow Liquidity ratio card on `/admin/keuangan`, so that I can confirm available platform reserves before executing partner withdrawals.
14. As an automated test runner, I want comprehensive E2E tests validating login, role switching, order creation, PIN handover, wallet crediting, and payout approvals across all sub-menus, so that the entire multi-role workflow remains stable and verifiable.

## Implementation Decisions

- **Domain Models & State**:
  - Enhance `Order` domain to track `containerCompliance` review: `'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING'`.
  - Maintain single source of truth in PostgreSQL (`orders`, `stores`, `surprise_bags`, `users`, `audit_logs`) with reactive SWR hooks and synchronization to `storeService` for client-side state.
- **UI Architecture & Antislop**:
  - Follow anti-slop rules: 0 em-dashes (- or : only), tabular numbers (`tabular-nums`) for currency and PIN codes, accessible WCAG AA color contrasts.
  - Dedicated route `/tickets`: rendered as a modern mobile boarding pass card with high contrast, large monospace PIN, dynamic QR, and store geolocation links.
  - `/seller` POS Mode: Toggleable focus state hiding sidebar layout, presenting a 12-button keypad (0-9, backspace, verify) with Web Audio API chime synthesis.
  - `/admin` Action Center: Reusable summary metric cards aggregating pending approvals across KYC, withdrawals, and dispute entities.
- **Testing Seams**:
  - High-level functional E2E test suite simulating all 3 actors (Admin, Seller, Buyer) through the full lifecycle:
    1. Discovery -> Cart -> Checkout -> Escrow Payment.
    2. Ticket Generation -> POS PIN Validation -> Order Completion.
    3. Wallet Balance Update -> Withdrawal Request -> Admin Payout Approval.
    4. Compliance Review Submission -> Admin Audit Log Inspection.

## Testing Decisions

- Test external behavior end-to-end, validating actual data transformations and business formulas (12% platform fee, 88% seller payout, Rp 1.000 buyer fee).
- Exercise every sub-menu URL across Buyer, Seller, and Admin to guarantee zero broken routes or runtime hydration exceptions.

## Out of Scope

- Native hardware thermal printer integration for POS receipts (browser print dialog is sufficient).
- Real payment gateway webhook integrations (handled via simulated QRIS/Escrow transition).

## Further Notes

- All changes strictly observe zero em-dashes and adhere to Next.js 16 App Router standards.
