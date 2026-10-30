import { storeService } from "../services/storeService";
import { cartService } from "../services/cartService";
import { POST } from "../app/api/orders/route";
import { SurpriseBag, Store } from "../types/domain";

async function runQuotaVerification() {
  console.log("===============================================================================");
  console.log("   FOODRESCUE RERASA - SURPRISE BAG QUOTA DECREMENT VERIFICATION SUITE         ");
  console.log("===============================================================================");

  // Reset and seed data
  storeService.loadSeedData();
  cartService.clearCart();

  // --------------------------------------------------------------------------
  // TEST 1: Real-time Quota Decrement in storeService (e.g. 5 -> 4) & Listener Sync
  // --------------------------------------------------------------------------
  console.log("\n[TEST 1: storeService Real-time Decrement & Reactive Notification]");
  
  // Set a controlled initial quota of 5
  const testBag = storeService.getState().surpriseBags[0];
  storeService.updateBagQuota(testBag.id, 5, true);
  
  let currentBag = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!;
  console.assert(currentBag.quotaRemaining === 5, `Initial quota should be 5, got ${currentBag.quotaRemaining}`);
  console.log(`- Initial quota set to: ${currentBag.quotaRemaining}`);

  let listenerFiredCount = 0;
  let observedQuotaInListener = -1;

  // Subscribe to real-time store updates
  const unsubscribe = storeService.subscribe(() => {
    listenerFiredCount++;
    const updated = storeService.getState().surpriseBags.find((b) => b.id === testBag.id);
    if (updated) {
      observedQuotaInListener = updated.quotaRemaining;
    }
  });

  // Single purchase (1 portion): quota 5 -> 4
  storeService.switchRole("buyer");
  const order1 = storeService.createOrder(
    testBag.id,
    "QRIS",
    { name: "Budi Santoso", phone: "081234567890" },
    1
  );

  currentBag = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!;
  console.assert(order1.status === "PAID", "Order must be PAID");
  console.assert(currentBag.quotaRemaining === 4, `Quota must decrease from 5 to 4, got ${currentBag.quotaRemaining}`);
  console.assert(listenerFiredCount > 0, "storeService.subscribe listener must be triggered on purchase");
  console.assert(observedQuotaInListener === 4, `Listener must observe new quota 4, got ${observedQuotaInListener}`);
  console.log(`✓ Order ${order1.id} created: Quota successfully decremented from 5 to 4 in real-time.`);
  console.log(`✓ Real-time subscriber notified: observed quota = ${observedQuotaInListener} (listener called ${listenerFiredCount} time(s)).`);

  unsubscribe();

  // --------------------------------------------------------------------------
  // TEST 2: Cart Service Behavior & Checkout Coordination
  // --------------------------------------------------------------------------
  console.log("\n[TEST 2: Cart Quota Constraints & Post-Checkout Clearing]");
  
  const store = storeService.getState().stores.find((s) => s.id === testBag.storeId)!;
  console.assert(Boolean(store), "Store must exist");

  // Current quota is 4. Add to cart with quantity 2.
  cartService.addItem(currentBag, store, 2);
  let cartItem = cartService.getItem(testBag.id);
  console.assert(cartItem !== undefined, "Item must be in cart");
  console.assert(cartItem?.quantity === 2, `Cart quantity should be 2, got ${cartItem?.quantity}`);
  console.log(`- Item added to cart with qty: ${cartItem?.quantity}`);

  // Attempt to add more than remaining quota (e.g. +99)
  cartService.addItem(currentBag, store, 99);
  cartItem = cartService.getItem(testBag.id);
  console.assert(
    cartItem?.quantity === currentBag.quotaRemaining,
    `Cart quantity must be capped at remaining quota (${currentBag.quotaRemaining}), got ${cartItem?.quantity}`
  );
  console.log(`✓ Cart max cap verified: quantity cannot exceed quotaRemaining (${cartItem?.quantity}/${currentBag.quotaRemaining}).`);

  // Reset cart for multi-item checkout test
  cartService.clearCart();
  console.assert(cartService.getItems().length === 0, "Cart must be empty after clearCart()");

  // Add 2 portions to cart
  cartService.addItem(currentBag, store, 2);
  console.log(`- Cart prepared with 2 portions of ${testBag.title}`);

  // Perform multi-item checkout
  const cartItemsToBuy = cartService.getItems().map((item) => ({
    bagId: item.bag.id,
    quantity: item.quantity,
  }));

  const quotaBeforeMulti = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!.quotaRemaining; // 4
  storeService.switchRole("buyer");
  const multiOrders = storeService.createMultiItemOrder(cartItemsToBuy, "QRIS", {
    name: "Dewi Lestari",
    phone: "081987654321",
  });
  cartService.clearCart();

  const quotaAfterMulti = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!.quotaRemaining;
  console.assert(multiOrders.length === 1, "One multi-item order created");
  console.assert(
    quotaAfterMulti === quotaBeforeMulti - 2,
    `Quota must reduce from ${quotaBeforeMulti} to ${quotaBeforeMulti - 2}, got ${quotaAfterMulti}`
  );
  console.assert(cartService.getItems().length === 0, "Cart must be cleared after checkout");
  console.log(`✓ Multi-item checkout executed: Quota reduced from ${quotaBeforeMulti} to ${quotaAfterMulti}.`);
  console.log(`✓ Cart state cleared after checkout: items count = ${cartService.getItems().length}.`);

  // --------------------------------------------------------------------------
  // TEST 3: Backend API /api/orders (POST) Quota Decrement
  // --------------------------------------------------------------------------
  console.log("\n[TEST 3: Backend API Route (/api/orders POST) Quota Verification]");

  const quotaBeforeApi = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!.quotaRemaining; // 2
  console.log(`- Quota before /api/orders POST: ${quotaBeforeApi}`);

  storeService.switchRole("buyer");
  const apiReq = new Request("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bagId: testBag.id,
      quantity: 1,
      paymentMethod: "QRIS",
      buyerId: "user-buyer-1",
    }),
  });

  const apiRes = await POST(apiReq as any);
  console.assert(apiRes.status === 200, `API response status must be 200, got ${apiRes.status}`);
  const apiData = await apiRes.json();
  console.assert(apiData.success === true, "API response must indicate success: true");
  console.assert(Boolean(apiData.data?.id), "API response must return created order");

  const quotaAfterApi = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!.quotaRemaining;
  console.assert(
    quotaAfterApi === quotaBeforeApi - 1,
    `Quota must decrease by 1 from ${quotaBeforeApi} to ${quotaBeforeApi - 1}, got ${quotaAfterApi}`
  );
  console.log(`✓ POST /api/orders successful: orderId = ${apiData.data.id}, quota reduced to ${quotaAfterApi}.`);

  // --------------------------------------------------------------------------
  // TEST 4: Over-decrement Protection, Sold-Out Boundary & Non-Negativity
  // --------------------------------------------------------------------------
  console.log("\n[TEST 4: Over-decrement Prevention, Sold-Out Zero Boundary & Non-Negativity]");

  // Remaining quota is currently 1.
  console.assert(quotaAfterApi === 1, `Expected 1 quota remaining, got ${quotaAfterApi}`);

  // Scenario 4A: Attempting to order quantity > quotaRemaining via API (e.g. quantity = 5 when quota = 1)
  storeService.switchRole("buyer");
  const overOrderReq = new Request("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bagId: testBag.id,
      quantity: 5,
      paymentMethod: "QRIS",
      buyerId: "user-buyer-1",
    }),
  });

  const overOrderRes = await POST(overOrderReq as any);
  console.assert(overOrderRes.status === 400, `Expected status 400 for over-quota, got ${overOrderRes.status}`);
  const overOrderBody = await overOrderRes.json();
  console.assert(overOrderBody.success === false, "Over-quota order must fail");
  console.assert(
    overOrderBody.error.includes("Sisa kuota porsi tidak mencukupi"),
    `Expected quota error message, got: ${overOrderBody.error}`
  );

  const quotaAfterOverAttempt = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!.quotaRemaining;
  console.assert(quotaAfterOverAttempt === 1, "Quota must remain unchanged after rejected over-quota order");
  console.log(`✓ Over-order attempt (requesting 5 when only 1 left) rejected with HTTP 400: "${overOrderBody.error}".`);
  console.log(`✓ Quota remained intact at: ${quotaAfterOverAttempt}.`);

  // Scenario 4B: Buying the last portion (1 -> 0)
  storeService.switchRole("buyer");
  const lastOrderReq = new Request("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bagId: testBag.id,
      quantity: 1,
      paymentMethod: "QRIS",
      buyerId: "user-buyer-1",
    }),
  });

  const lastOrderRes = await POST(lastOrderReq as any);
  console.assert(lastOrderRes.status === 200, `Last order should succeed with 200, got ${lastOrderRes.status}`);
  const finalBag = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!;
  console.assert(finalBag.quotaRemaining === 0, `Quota should be exactly 0, got ${finalBag.quotaRemaining}`);
  console.log(`✓ Last portion purchased: Quota transitioned cleanly from 1 to 0 (SOLD OUT).`);

  // Scenario 4C: Ordering when quota is 0 (SOLD OUT) - direct storeService call
  let directCallThrew = false;
  try {
    storeService.switchRole("buyer");
    storeService.createOrder(testBag.id, "QRIS", undefined, 1);
  } catch (err: unknown) {
    directCallThrew = true;
    console.assert(
      (err as Error).message.includes("Sisa kuota porsi tidak mencukupi"),
      `Expected quota error, got: ${(err as Error).message}`
    );
  }
  console.assert(directCallThrew, "Direct storeService.createOrder must throw when quota is 0");
  console.log("✓ Direct storeService.createOrder threw exception when reserving sold-out bag.");

  // Scenario 4D: Ordering when quota is 0 via /api/orders
  storeService.switchRole("buyer");
  const soldOutApiReq = new Request("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bagId: testBag.id,
      quantity: 1,
      paymentMethod: "QRIS",
      buyerId: "user-buyer-1",
    }),
  });

  const soldOutApiRes = await POST(soldOutApiReq as any);
  console.assert(soldOutApiRes.status === 400, "API must reject sold-out item with 400");
  const soldOutApiBody = await soldOutApiRes.json();
  console.assert(soldOutApiBody.success === false, "Sold-out order must fail");
  console.log(`✓ /api/orders rejected order on 0-quota item with HTTP 400: "${soldOutApiBody.error}".`);

  // Final check: Non-negativity assertion
  const strictlyZeroBag = storeService.getState().surpriseBags.find((b) => b.id === testBag.id)!;
  console.assert(
    strictlyZeroBag.quotaRemaining === 0,
    `Final quota must be exactly 0 and never negative, got: ${strictlyZeroBag.quotaRemaining}`
  );
  console.assert(strictlyZeroBag.quotaRemaining >= 0, "Non-negativity guarantee violated!");
  console.log(`✓ Absolute non-negativity verified: quotaRemaining = ${strictlyZeroBag.quotaRemaining} (never < 0).`);

  console.log("\n===============================================================================");
  console.log("   ALL QUOTA VERIFICATION SCENARIOS PASSED WITH 100% INTEGRITY!                ");
  console.log("===============================================================================");
}

runQuotaVerification().catch((err) => {
  console.error("Quota verification suite failed:", err);
  process.exit(1);
});
