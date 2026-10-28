import { storeService } from "../services/storeService";

console.log("=== RUNNING FOOD RESCUE SIMULATION TESTS ===");

// 1. Initial State verification
const initialState = storeService.getState();
console.assert(initialState.stores.length >= 4, "Initial stores should be at least 4");
console.assert(initialState.surpriseBags.length >= 4, "Initial surprise bags should be at least 4");
console.log("✓ Initial state verified");

// 2. Buyer creates order (Ruby Bakery Bread Bag)
const bag = initialState.surpriseBags.find((b) => b.storeId === "store-ruby-bakery")!;
const initialRemaining = bag.quotaRemaining;
const newOrder = storeService.createOrder(bag.id, "QRIS");

console.assert(newOrder.status === "PAID", "New order should be PAID");
console.assert(newOrder.pickupCode.length === 4, "PIN should be 4 digits");
console.assert(bag.quotaRemaining === initialRemaining - 1, "Bag quota should decrease by 1");
console.log(`✓ Buyer ordered ${newOrder.id} with PIN ${newOrder.pickupCode}`);

// 3. Buyer & Seller Chat
storeService.switchRole("buyer");
const buyerMsg = storeService.sendChatMessage(newOrder.id, "Halo saya sedang di jalan menuju toko");
console.assert(buyerMsg.senderRole === "buyer", "Message sender should be buyer");

storeService.switchRole("seller");
const sellerMsg = storeService.sendChatMessage(newOrder.id, "Siap kak, sudah kami kemas di Rescue Box resmi!");
console.assert(sellerMsg.senderRole === "seller", "Message sender should be seller");
console.log("✓ In-app chat exchange verified");

// 4. Seller POS Verification & Escrow Release
const rubyStore = storeService.getStores().find((s) => s.id === "store-ruby-bakery")!;
const initialBalance = rubyStore.walletBalance;

const verifyRes = storeService.verifyPickup(newOrder.pickupCode);
console.assert(verifyRes.success, "Verification with PIN should succeed");
console.assert(newOrder.status === "COMPLETED", "Order should be COMPLETED");
console.assert(rubyStore.walletBalance === initialBalance + newOrder.sellerEarning, "Seller balance should receive escrow release");
console.log(`✓ Escrow released! Added Rp ${newOrder.sellerEarning} to Ruby Bakery`);

// 5. Buyer Review & Rescue Box Compliance
storeService.switchRole("buyer");
const review = storeService.submitReview(newOrder.id, 5, "Kemasan sangat rapi dan roti masih hangat!", true);
console.assert(review.usedOfficialRescueBox === true, "Compliance flag recorded");
console.assert(rubyStore.boxComplianceRate >= 90, "Compliance rate should reflect official box usage");
console.log("✓ Box compliance review submitted");

// 6. Seller B2B Rescue Box Order
storeService.switchRole("seller");
const boxPkg = storeService.getState().boxPackages[0]; // 50 pcs
const initialBoxes = rubyStore.currentBoxStock;
const boxOrder = storeService.orderRescueBoxes(rubyStore.id, boxPkg.id, rubyStore.address);
console.assert(rubyStore.currentBoxStock === initialBoxes + 50, "Box stock should increment by 50 pcs");
console.log(`✓ B2B Rescue Box ordered (${boxOrder.id}), tracking: ${boxOrder.trackingNumber}`);

// 7. Seller Withdrawal Request & Admin Approval
const wd = storeService.requestWithdrawal(rubyStore.id, 100000);
console.assert(wd.status === "PENDING", "Withdrawal status should be PENDING");

storeService.switchRole("super_admin");
storeService.approveWithdrawal(wd.id);
console.assert(wd.status === "APPROVED", "Withdrawal status should be APPROVED");
console.log(`✓ Seller withdrawal ${wd.id} approved by Super Admin`);

// 8. Super Admin Approves New Store KYC
const pendingStore = storeService.getStores().find((s) => s.status === "PENDING_APPROVAL")!;
storeService.updateStoreStatus(pendingStore.id, "ACTIVE");
console.assert(pendingStore.status === "ACTIVE", "Store status should be ACTIVE");
console.log(`✓ New store ${pendingStore.name} approved by Super Admin`);

console.log("=== ALL SIMULATION STEPS PASSED SUCCESSFULLY ===");
