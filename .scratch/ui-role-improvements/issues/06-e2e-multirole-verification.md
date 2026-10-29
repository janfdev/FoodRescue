# 06: Comprehensive Multi-Role E2E Verification Test Suite

**What to build:**
Create an automated test suite verifying all 3 roles (Super Admin, Seller, Buyer) across every sub-menu route and end-to-end operational flow:
1. Buyer discovers bag, adds to cart, checks out with Escrow guarantee, and views `/tickets`.
2. Seller opens POS mode, keys in 4-digit PIN, triggers audio chime, and completes handover.
3. Seller wallet is credited with 88% net earnings, places withdrawal request.
4. Admin reviews Urgent Action feed, inspects partner KYC, and approves payout.
5. All 37+ sub-menu routes return 200 without runtime crashes or 404s.

**Blocked by:** 05: Admin Urgent Action Center, Split KYC Reviewer & Payout Utilities

**Status:** ready-for-agent

- [ ] Complete E2E simulation script tests full buyer-seller-admin lifecycle
- [ ] Sub-menu health check validates all routes respond properly
- [ ] Financial formula calculations (Rp 1.000 fee, 12% platform fee, 88% seller cut) verified
- [ ] All tests pass cleanly in test runner
