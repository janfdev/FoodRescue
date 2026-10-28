"use client";

import {
  Store,
  SurpriseBag,
  Order,
  RescueBoxPackage,
  RescueBoxOrder,
  Review,
  ChatMessage,
  WithdrawalRequest,
  DisputeTicket,
  User,
  UserRole
} from "@/types/domain";
import {
  SEED_STORES,
  SEED_SURPRISE_BAGS,
  SEED_BOX_PACKAGES,
  SEED_ORDERS,
  SEED_BOX_ORDERS,
  SEED_REVIEWS,
  SEED_USERS
} from "./seedData";
import { getDefaultAvatar, resolveUserAvatar } from "@/lib/avatar";

const STORAGE_KEY = "sisarasa_app_state_v1";

interface AppState {
  currentUser: User;
  stores: Store[];
  surpriseBags: SurpriseBag[];
  orders: Order[];
  boxPackages: RescueBoxPackage[];
  boxOrders: RescueBoxOrder[];
  reviews: Review[];
  chatMessages: Record<string, ChatMessage[]>; // keyed by orderId
  withdrawals: WithdrawalRequest[];
  disputes: DisputeTicket[];
}

const DEFAULT_INITIAL_STATE: AppState = {
  currentUser: SEED_USERS[0], // default: Budi (Buyer)
  stores: SEED_STORES,
  surpriseBags: SEED_SURPRISE_BAGS,
  orders: SEED_ORDERS,
  boxPackages: SEED_BOX_PACKAGES,
  boxOrders: SEED_BOX_ORDERS,
  reviews: SEED_REVIEWS,
  chatMessages: {
    "RB-7821": [
      {
        id: "msg-1",
        orderId: "RB-7821",
        senderRole: "system",
        senderName: "Sistem Escrow",
        text: "Pesanan telah dibayar Rp 24.000. Dana diamankan di Rekber Escrow. Silakan ambil paket pada jam 19:30 - 21:30 WIB.",
        timestamp: "2026-10-28T18:40:05Z"
      },
      {
        id: "msg-2",
        orderId: "RB-7821",
        senderRole: "buyer",
        senderName: "Budi Santoso",
        senderAvatarUrl: getDefaultAvatar("BudiSantoso"),
        text: "Halo kak, saya otw ambil sekitar jam 20:00 ya.",
        timestamp: "2026-10-28T18:45:00Z"
      },
      {
        id: "msg-3",
        orderId: "RB-7821",
        senderRole: "seller",
        senderName: "Ruby Bakery & Cake",
        senderAvatarUrl: getDefaultAvatar("SitiRahma"),
        text: "Baik kak Budi! Paket surprise bag sudah kami siapkan di kemasan Rescue Box resmi. Ditunggu di kasir ya.",
        timestamp: "2026-10-28T18:46:12Z"
      }
    ],
    "RB-6100": [
      {
        id: "msg-61-1",
        orderId: "RB-6100",
        senderRole: "system",
        senderName: "Sistem Escrow",
        text: "Pesanan telah dibayar dan diverifikasi kasir. Dana Rp 21.120 berhasil dilepas ke saldo toko.",
        timestamp: "2026-10-25T20:10:00Z"
      }
    ],
    "RB-5219": [
      {
        id: "msg-52-1",
        orderId: "RB-5219",
        senderRole: "system",
        senderName: "Sistem Escrow",
        text: "Pengambilan makanan di Nasi Jamblang Mang Dul berhasil diverifikasi.",
        timestamp: "2026-10-26T21:05:00Z"
      }
    ]
  },
  withdrawals: [
    {
      id: "WD-101",
      storeId: "store-ruby-bakery",
      storeName: "Ruby Bakery & Cake",
      amount: 500000,
      bankName: "BCA",
      accountNumber: "1340889211",
      accountHolder: "Siti Rahmawati",
      status: "APPROVED",
      requestedAt: "2026-10-22T09:00:00Z",
      processedAt: "2026-10-22T14:30:00Z"
    },
    {
      id: "WD-102",
      storeId: "store-jamblang-dul",
      storeName: "Nasi Jamblang Mang Dul",
      amount: 400000,
      bankName: "BRI",
      accountNumber: "010901029384501",
      accountHolder: "Abdul Kadir Mang Dul",
      status: "PENDING",
      requestedAt: "2026-10-27T10:15:00Z"
    }
  ],
  disputes: []
};

class StoreService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = DEFAULT_INITIAL_STATE;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Migrasi avatar jika masih menggunakan format lama atau kosong
          if (parsed?.currentUser) {
            parsed.currentUser.avatarUrl = resolveUserAvatar(
              parsed.currentUser.avatarUrl,
              parsed.currentUser.name
            );
          }
          this.state = parsed;
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
      } catch (e) {
        console.error("Gagal memuat state dari localStorage:", e);
      }
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error("Gagal menyimpan state ke localStorage:", e);
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppState {
    return this.state;
  }

  public resetToDefault() {
    this.state = DEFAULT_INITIAL_STATE;
    this.persist();
  }

  // =====================
  // USER & ROLE SWITCHING
  // =====================
  public switchRole(role: UserRole) {
    const targetUser = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
    this.state.currentUser = targetUser;
    if (typeof window !== "undefined") {
      localStorage.setItem("foodrescue_auth_user", JSON.stringify(targetUser));
    }
    this.persist();
  }

  public setCurrentUser(user: User) {
    this.state.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("foodrescue_auth_user", JSON.stringify(user));
    }
    this.persist();
  }

  public loginWithEmail(email: string): User {
    const user =
      SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email: email.toLowerCase(),
        role: "buyer" as UserRole,
        phone: "081234567890",
        avatarUrl: getDefaultAvatar(email.split("@")[0]),
        status: "ACTIVE" as const,
        createdAt: new Date().toISOString(),
      };

    this.state.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("foodrescue_auth_user", JSON.stringify(user));
      localStorage.setItem("foodrescue_guest_name", user.name);
      localStorage.setItem("foodrescue_guest_phone", user.phone);
    }
    this.persist();
    return user;
  }

  public logoutUser() {
    this.state.currentUser = SEED_USERS[0];
    if (typeof window !== "undefined") {
      localStorage.removeItem("foodrescue_auth_user");
    }
    this.persist();
  }

  public updateUserProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      avatarUrl?: string;
      storeData?: {
        name?: string;
        phone?: string;
        area?: string;
        pickupStartTime?: string;
        pickupEndTime?: string;
        address?: string;
      };
    }
  ) {
    if (this.state.currentUser.id === userId) {
      this.state.currentUser = {
        ...this.state.currentUser,
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("foodrescue_auth_user", JSON.stringify(this.state.currentUser));
      }
    }

    // If storeData is provided, update associated store
    if (data.storeData) {
      const storeIndex = this.state.stores.findIndex(
        (s) =>
          (this.state.currentUser.storeId && s.id === this.state.currentUser.storeId) ||
          s.name.toLowerCase().includes(this.state.currentUser.name.toLowerCase())
      );
      if (storeIndex !== -1) {
        const currentStore = this.state.stores[storeIndex];
        this.state.stores[storeIndex] = {
          ...currentStore,
          ...(data.storeData.name ? { name: data.storeData.name } : {}),
          ...(data.storeData.area ? { area: data.storeData.area } : {}),
          ...(data.storeData.pickupStartTime ? { pickupStartTime: data.storeData.pickupStartTime } : {}),
          ...(data.storeData.pickupEndTime ? { pickupEndTime: data.storeData.pickupEndTime } : {}),
          ...(data.storeData.address ? { address: data.storeData.address } : {}),
        };
      }
    }

    this.persist();
  }

  // =====================
  // STORES & SURPRISE BAGS
  // =====================
  public getStores(): Store[] {
    return this.state.stores;
  }

  public getActiveStores(): Store[] {
    return this.state.stores.filter((s) => s.status === "ACTIVE");
  }

  public getSurpriseBags(): SurpriseBag[] {
    return this.state.surpriseBags;
  }

  public updateBagQuota(bagId: string, newQuota: number, isActive: boolean) {
    this.state.surpriseBags = this.state.surpriseBags.map((b) => {
      if (b.id === bagId) {
        return {
          ...b,
          quotaToday: newQuota,
          quotaRemaining: Math.max(0, newQuota),
          isActive
        };
      }
      return b;
    });
    this.persist();
  }

  public addSurpriseBag(bagData: Omit<SurpriseBag, "id">): SurpriseBag {
    const newId = `bag-${Date.now()}`;
    const newBag: SurpriseBag = {
      ...bagData,
      id: newId,
    };
    this.state.surpriseBags.unshift(newBag);
    this.persist();
    return newBag;
  }

  // =====================
  // BUYER ORDER & ESCROW
  // =====================
  public createOrder(
    bagId: string,
    paymentMethod: Order["paymentMethod"],
    guestDetails?: { name: string; phone: string },
    quantity: number = 1
  ): Order {
    const bag = this.state.surpriseBags.find((b) => b.id === bagId);
    if (!bag) throw new Error("Paket tidak ditemukan");
    if (bag.quotaRemaining < quantity) throw new Error("Sisa kuota porsi tidak mencukupi");

    const store = this.state.stores.find((s) => s.id === bag.storeId);
    if (!store) throw new Error("Toko tidak ditemukan");

    // Reduce bag quota
    bag.quotaRemaining -= quantity;

    // Nomor pesanan unik e.g. "RB-8492"
    const orderId = `RB-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotalPrice = bag.discountedPrice * quantity;
    const adminFee = 1000; // Biaya layanan aplikasi Rp 1.000
    const totalPrice = subtotalPrice + adminFee;
    const platformFee = Math.round(subtotalPrice * 0.12); // 12% take-rate toko
    const sellerEarning = subtotalPrice - platformFee;

    const buyerName = guestDetails?.name || this.state.currentUser.name;
    const buyerPhone = guestDetails?.phone || this.state.currentUser.phone;

    const newOrder: Order = {
      id: orderId,
      buyerId: guestDetails ? `guest-${Date.now()}` : this.state.currentUser.id,
      buyerName,
      buyerPhone,
      storeId: store.id,
      storeName: store.name,
      bagId: bag.id,
      bagTitle: bag.title,
      quantity,
      unitPrice: bag.discountedPrice,
      subtotalPrice,
      adminFee,
      totalPrice,
      platformFee,
      sellerEarning,
      status: "PAID", // Pembayaran langsung terkonfirmasi (seperti Gojek / Grab)
      paymentMethod,
      paidAt: new Date().toISOString(),
      pickupCode: orderId,
      pickupQrData: `RESCUE_ORDER:${orderId}`,
      isChatLocked: false
    };

    this.state.orders.unshift(newOrder);

    // Initial system chat message
    this.state.chatMessages[orderId] = [
      {
        id: `msg-${Date.now()}`,
        orderId,
        senderRole: "system",
        senderName: "Sistem Transaksi",
        text: `Pesanan ${orderId} berhasil dibayar Rp ${totalPrice.toLocaleString("id-ID")}. Pembeli dapat langsung mengambil makanan surplus ke lokasi ${store.name} dengan menyebutkan nomor pesanan.`,
        timestamp: new Date().toISOString()
      }
    ];

    this.persist();
    return newOrder;
  }

  // =====================
  // PHYSICAL PICKUP & ESCROW RELEASE (1-CLICK CASHIER HANDOVER)
  // =====================
  public confirmOrderHandover(orderId: string): { success: boolean; message: string; order?: Order } {
    return this.verifyPickup(orderId);
  }

  public verifyPickup(pickupCodeOrQr: string): { success: boolean; message: string; order?: Order } {
    let code = pickupCodeOrQr.trim();
    if (code.startsWith("RESCUE_ORDER:")) {
      const parts = code.split(":");
      code = parts[2] || parts[1];
    }

    const order = this.state.orders.find(
      (o) => (o.pickupCode === code || o.id === code) && (o.status === "PAID" || o.status === "READY_FOR_PICKUP")
    );

    if (!order) {
      return {
        success: false,
        message: "Nomor pesanan tidak ditemukan atau pesanan sudah diselesaikan sebelumnya."
      };
    }

    // Update Order Status
    order.status = "COMPLETED";
    order.completedAt = new Date().toISOString();

    // Release Escrow to Seller Wallet
    const store = this.state.stores.find((s) => s.id === order.storeId);
    if (store) {
      store.walletBalance += order.sellerEarning;
      store.boxesSoldTotal += 1;
      if (store.currentBoxStock > 0) {
        store.currentBoxStock -= 1;
      }
    }

    // System chat notification
    if (!this.state.chatMessages[order.id]) {
      this.state.chatMessages[order.id] = [];
    }
    this.state.chatMessages[order.id].push({
      id: `msg-${Date.now()}`,
      orderId: order.id,
      senderRole: "system",
      senderName: "Sistem",
      text: `Serah-terima fisik berhasil diverifikasi! Dana sebesar Rp ${order.sellerEarning.toLocaleString(
        "id-ID"
      )} telah dilepas dari Escrow ke saldo dompet mitra toko. Terima kasih telah menyelamatkan makanan!`,
      timestamp: new Date().toISOString()
    });

    this.persist();
    return {
      success: true,
      message: `Pengambilan pesanan ${order.id} berhasil! Dana Rp ${order.sellerEarning.toLocaleString(
        "id-ID"
      )} masuk ke saldo dompet toko.`,
      order
    };
  }

  // =====================
  // IN-APP CHAT
  // =====================
  public getChatMessages(orderId: string): ChatMessage[] {
    return this.state.chatMessages[orderId] || [];
  }

  public sendChatMessage(orderId: string, text: string): ChatMessage {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan");

    // Check if chat is locked (24 hours after completion)
    if (order.status === "COMPLETED" && order.completedAt) {
      const completedTime = new Date(order.completedAt).getTime();
      const now = Date.now();
      if (now - completedTime > 24 * 60 * 60 * 1000) {
        order.isChatLocked = true;
        this.persist();
        throw new Error("Chat sudah terkunci otomatis (24 jam setelah pesanan selesai).");
      }
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      senderRole: this.state.currentUser.role === "seller" ? "seller" : "buyer",
      senderName: this.state.currentUser.name,
      senderAvatarUrl:
        this.state.currentUser.avatarUrl ||
        getDefaultAvatar(this.state.currentUser.name),
      text,
      timestamp: new Date().toISOString()
    };

    if (!this.state.chatMessages[orderId]) {
      this.state.chatMessages[orderId] = [];
    }

    this.state.chatMessages[orderId].push(newMessage);
    this.persist();
    return newMessage;
  }

  // =====================
  // B2B RESCUE BOX STORE
  // =====================
  public orderRescueBoxes(storeId: string, packageId: RescueBoxPackage["id"], address: string): RescueBoxOrder {
    const pkg = this.state.boxPackages.find((p) => p.id === packageId);
    if (!pkg) throw new Error("Paket kemasan tidak ditemukan");

    const store = this.state.stores.find((s) => s.id === storeId);
    if (!store) throw new Error("Toko tidak ditemukan");

    const newBoxOrder: RescueBoxOrder = {
      id: `BOX-ORD-${Math.floor(100 + Math.random() * 900)}`,
      storeId: store.id,
      storeName: store.name,
      packageId: pkg.id,
      quantityPcs: pkg.quantityPcs,
      totalPrice: pkg.price,
      shippingAddress: address || store.address,
      status: "SHIPPED", // instant shipping simulation
      trackingNumber: `SICEPAT-CRB-${Math.floor(100000 + Math.random() * 900000)}`,
      orderedAt: new Date().toISOString()
    };

    // Increase store's physical box stock
    store.currentBoxStock += pkg.quantityPcs;

    this.state.boxOrders.unshift(newBoxOrder);
    this.persist();
    return newBoxOrder;
  }

  // =====================
  // REVIEWS & COMPLIANCE
  // =====================
  public submitReview(orderId: string, rating: number, comment: string, usedOfficialRescueBox: boolean): Review {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan");

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      orderId,
      storeId: order.storeId,
      buyerId: this.state.currentUser.id,
      buyerName: this.state.currentUser.name,
      rating,
      comment,
      usedOfficialRescueBox,
      createdAt: new Date().toISOString()
    };

    this.state.reviews.unshift(newReview);

    // Recalculate store compliance rate
    const storeReviews = this.state.reviews.filter((r) => r.storeId === order.storeId);
    if (storeReviews.length > 0) {
      const compliantCount = storeReviews.filter((r) => r.usedOfficialRescueBox).length;
      const rate = Math.round((compliantCount / storeReviews.length) * 100);
      const store = this.state.stores.find((s) => s.id === order.storeId);
      if (store) {
        store.boxComplianceRate = rate;
      }
    }

    this.persist();
    return newReview;
  }

  // =====================
  // SELLER WITHDRAWAL
  // =====================
  public requestWithdrawal(storeId: string, amount: number): WithdrawalRequest {
    const store = this.state.stores.find((s) => s.id === storeId);
    if (!store) throw new Error("Toko tidak ditemukan");
    if (store.walletBalance < amount) throw new Error("Saldo dompet toko tidak mencukupi");

    store.walletBalance -= amount;

    const req: WithdrawalRequest = {
      id: `WD-${Math.floor(100 + Math.random() * 900)}`,
      storeId: store.id,
      storeName: store.name,
      amount,
      bankName: store.bankAccount?.bankName || "BCA",
      accountNumber: store.bankAccount?.accountNumber || "1234567890",
      accountHolder: store.bankAccount?.accountHolder || store.name,
      status: "PENDING",
      requestedAt: new Date().toISOString()
    };

    this.state.withdrawals.unshift(req);
    this.persist();
    return req;
  }

  public approveWithdrawal(withdrawalId: string) {
    const req = this.state.withdrawals.find((w) => w.id === withdrawalId);
    if (req) {
      req.status = "APPROVED";
      req.processedAt = new Date().toISOString();
      this.persist();
    }
  }

  // =====================
  // SUPER ADMIN ACTIONS
  // =====================
  public updateStoreStatus(storeId: string, status: Store["status"]) {
    const store = this.state.stores.find((s) => s.id === storeId);
    if (store) {
      store.status = status;
      this.persist();
    }
  }

  // =====================
  // AGGREGATE IMPACT METRICS
  // =====================
  public getImpactMetrics() {
    const completedOrders = this.state.orders.filter((o) => o.status === "COMPLETED");
    const totalOrdersCount = completedOrders.length;

    // Estimate kg of food saved: avg 0.8 kg per bag
    const estimatedKgSaved = (totalOrdersCount * 0.8) + 148.5; // with historical baseline

    const gmv = this.state.orders
      .filter((o) => o.status === "COMPLETED" || o.status === "PAID")
      .reduce((acc, o) => acc + o.totalPrice, 0);

    const platformRevenue = this.state.orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((acc, o) => acc + o.platformFee, 0);

    const totalBoxesSold = this.state.boxOrders
      .filter((b) => b.status === "DELIVERED" || b.status === "SHIPPED")
      .reduce((acc, b) => acc + b.quantityPcs, 0);

    return {
      totalMealsSaved: totalOrdersCount + 185,
      estimatedKgSaved: Math.round(estimatedKgSaved * 10) / 10,
      gmv,
      platformRevenue,
      totalBoxesSold,
      activeStoresCount: this.state.stores.filter((s) => s.status === "ACTIVE").length,
      pendingStoresCount: this.state.stores.filter((s) => s.status === "PENDING_APPROVAL").length
    };
  }
}

export const storeService = new StoreService();
