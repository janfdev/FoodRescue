# 05: Admin Urgent Action Center, Split KYC Reviewer & Payout Utilities

**What to build:**
Upgrade `/admin` with an "Urgent Action Required" summary card tracking pending partner approvals, withdrawal requests, and packaging disputes. Enhance `/admin/mitra` with a split-screen layout for inspecting merchant KYC documents with keyboard shortcuts (`A` approve, `S` suspend). On `/admin/keuangan`, add a 1-click bank account copy button with visual feedback and an Escrow Liquidity reserve widget.

**Blocked by:** 04: Seller Inventory Visual Quota & Box Depletion Forecast

**Status:** ready-for-agent

- [ ] `/admin` displays Action Required panel with live pending count badges
- [ ] `/admin/mitra` supports split inspection of KYC documents with zoom capability
- [ ] `/admin/keuangan` provides 1-click account number copying with "Tersalin!" badge
- [ ] Escrow liquidity metric shows total escrow held vs pending withdrawal demands
