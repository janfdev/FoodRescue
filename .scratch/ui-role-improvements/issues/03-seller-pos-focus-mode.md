# 03: Seller POS Focus Mode & Audio Feedback

**What to build:**
Add a toggleable "Mode Kasir Fokus" at `/seller`. When active, it hides navigation sidebars and presents a full-screen, high-contrast touch keypad (0-9, backspace, verifikasi) for fast 4-digit PIN input. Integrate a subtle Web Audio API chime on successful validation.

**Blocked by:** 01: Buyer Digital Boarding Pass & Checkout Escrow Guarantee

**Status:** ready-for-agent

- [ ] Toggle button switches between standard dashboard and Fullscreen POS Mode
- [ ] Virtual touch keypad allows rapid 4-digit PIN input without physical keyboard
- [ ] Successful PIN verification triggers pleasant audio chime feedback
- [ ] Order status updates to COMPLETED and releases 88% seller payout to store wallet
