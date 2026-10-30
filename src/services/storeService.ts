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
  UserRole,
  StoreCategory
} from "@/types/domain";
import {
  SEED_STORES,
  SEED_SURPRISE_BAGS,
  SEED_BOX_PACKAGES,
  SEED_ORDERS,
  SEED_BOX_ORDERS,
  SEED_REVIEWS,
  SEED_CHAT_MESSAGES,
  SEED_WITHDRAWALS,
  SEED_DISPUTES,
  SEED_USERS
} from "./seedData";
import { getDefaultAvatar, resolveUserAvatar } from "@/lib/avatar";

const STORAGE_KEY = "rerasa_app_state_db_clean_v2";

interface AppState {
  currentUser: User | null;
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

export const DEFAULT_INITIAL_STATE: AppState = {
  currentUser: null,
  stores: SEED_STORES,
  surpriseBags: SEED_SURPRISE_BAGS,
  orders: SEED_ORDERS,
  boxPackages: SEED_BOX_PACKAGES,
  boxOrders: SEED_BOX_ORDERS,
  reviews: SEED_REVIEWS,
  chatMessages: SEED_CHAT_MESSAGES,
  withdrawals: SEED_WITHDRAWALS,
  disputes: SEED_DISPUTES,
};

class StoreService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = { ...DEFAULT_INITIAL_STATE };
    if (typeof window !== "undefined") {
      try {
        const cachedAuth = localStorage.getItem("foodrescue_auth_user");
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Default awal: user TIDAK login otomatis. Hanya login jika ada data auth valid di localStorage
          if (cachedAuth) {
            try {
              const authUser = JSON.parse(cachedAuth);
              if (authUser && authUser.id) {
                authUser.avatarUrl = resolveUserAvatar(
                  authUser.avatarUrl,
                  authUser.name
                );
                parsed.currentUser = authUser;
              } else {
                parsed.currentUser = null;
              }
            } catch {
              parsed.currentUser = null;
            }
          } else {
            parsed.currentUser = null;
          }
          if (!parsed.stores || parsed.stores.length === 0) {
            parsed.stores = SEED_STORES;
          } else {
            parsed.stores = parsed.stores.map((s: Store) => {
              const seedMatch = SEED_STORES.find((sm) => sm.id === s.id);
              if (seedMatch && (!s.logoUrl || s.logoUrl.includes("unsplash.com"))) {
                return { ...s, logoUrl: seedMatch.logoUrl };
              }
              return s;
            });
          }
          if (!parsed.surpriseBags || parsed.surpriseBags.length === 0) {
            parsed.surpriseBags = SEED_SURPRISE_BAGS;
          }
          if (!parsed.orders || parsed.orders.length === 0) {
            parsed.orders = SEED_ORDERS;
          }
          // Pastikan walletBalance tiap toko selalu mencerminkan akumulasi seluruh pesanan selesai
          if (parsed.stores && parsed.orders) {
            parsed.stores = parsed.stores.map((st: Store) => {
              const completedEarnings = (parsed.orders || [])
                .filter((o: Order) => o.storeId === st.id && o.status === "COMPLETED")
                .reduce((sum: number, o: Order) => sum + (o.sellerEarning || Math.round((o.totalPrice || 0) * 0.9)), 0);
              const totalWd = (parsed.withdrawals || [])
                .filter((w: WithdrawalRequest) => w.storeId === st.id && (w.status === "APPROVED" || w.status === "PENDING"))
                .reduce((sum: number, w: WithdrawalRequest) => sum + w.amount, 0);
              const balance = Math.max(0, completedEarnings - totalWd);
              if (completedEarnings > 0) {
                return { ...st, walletBalance: balance };
              }
              return st;
            });
          }
          // State parsed from storage
          this.state = parsed;
        } else {
          this.state = { ...DEFAULT_INITIAL_STATE };
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
    this.state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    this.persist();
  }

  public clearAllData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
    this.persist();
  }

  public loadSeedData() {
    this.state = {
      currentUser: null,
      stores: SEED_STORES,
      surpriseBags: SEED_SURPRISE_BAGS,
      orders: SEED_ORDERS,
      boxPackages: SEED_BOX_PACKAGES,
      boxOrders: SEED_BOX_ORDERS,
      reviews: SEED_REVIEWS,
      chatMessages: SEED_CHAT_MESSAGES,
      withdrawals: SEED_WITHDRAWALS,
      disputes: SEED_DISPUTES,
    };
    this.persist();
  }

  // =====================
  // USER & ROLE SWITCHING
  // =====================
  public switchRole(role: UserRole) {
    const targetUser =
      SEED_USERS.find((u) => u.role === role) || {
        id: `user-${role}-demo`,
        name: role === "seller" ? "Siti Rahmawati (Ruby Bakery)" : role === "admin" ? "Admin Rerasa" : "Budi Santoso",
        email: `${role}@rerasa.com`,
        role: role,
        phone: "081234567890",
        status: "ACTIVE" as const,
        avatarUrl: getDefaultAvatar(role),
        storeId: role === "seller" ? "store-ruby-bakery" : undefined,
        createdAt: new Date().toISOString(),
      };
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
      document.cookie = `rerasa_user_role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
    }
    this.persist();
  }

  public async loginWithEmailAsync(email: string): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();
    let user: User | null = null;

    try {
      // 1. Sinkronisasi data user dari DB
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const found = json.data.find((u: any) => u.email.toLowerCase() === cleanEmail);
        if (found) {
          user = {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role,
            phone: found.phone || "-",
            avatarUrl: resolveUserAvatar(found.avatarUrl, found.name),
            status: found.status || "ACTIVE",
            storeId: found.storeId,
          };
        }
      }

      // 2. Sinkronisasi data stores dari DB jika ada
      const storeRes = await fetch("/api/stores");
      const storeJson = await storeRes.json();
      if (storeJson.success && Array.isArray(storeJson.data) && storeJson.data.length > 0) {
        const activeStores: Store[] = storeJson.data.map((dbStore: any) => ({
          id: dbStore.id,
          name: dbStore.name,
          category: dbStore.category,
          address: dbStore.address,
          area: dbStore.area,
          latitude: Number(dbStore.latitude) || -6.7172,
          longitude: Number(dbStore.longitude) || 108.5412,
          rating: Number(dbStore.rating) || 4.8,
          reviewCount: dbStore.reviewCount || 0,
          isOpen: dbStore.isOpen ?? true,
          status: dbStore.status || "ACTIVE",
          logoUrl: dbStore.logoUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80",
          imageUrl: dbStore.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
          pickupStartTime: dbStore.pickupStartTime || "19:30",
          pickupEndTime: dbStore.pickupEndTime || "21:30",
          boxComplianceRate: dbStore.boxComplianceRate || 95,
          boxesSoldTotal: dbStore.boxesSoldTotal || 0,
          currentBoxStock: dbStore.currentBoxStock || 0,
          walletBalance: dbStore.walletBalance || 0,
          bankAccount: dbStore.bankAccount || undefined,
          kycDetails: dbStore.kycDetails || undefined,
        }));

        // Gabungkan atau replace stores di state
        this.state.stores = activeStores;
      }
    } catch (e) {
      console.warn("Gagal lookup user/store dari API saat login:", e);
    }

    if (!user) {
      user = this.loginWithEmail(email);
      return user;
    }

    this.state.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("foodrescue_auth_user", JSON.stringify(user));
      localStorage.setItem("foodrescue_guest_name", user.name);
      localStorage.setItem("foodrescue_guest_phone", user.phone);
      document.cookie = `rerasa_user_role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
    }
    this.persist();
    return user;
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
      document.cookie = `rerasa_user_role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
    }
    this.persist();
    return user;
  }

  public logoutUser() {
    this.state.currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("foodrescue_auth_user");
      document.cookie = `rerasa_user_role=; path=/; max-age=0; SameSite=Lax`;
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
        logoUrl?: string;
      };
    }
  ) {
    if (!this.state.currentUser || this.state.currentUser.id === userId) {
      const current = this.state.currentUser || SEED_USERS.find((u) => u.id === userId) || SEED_USERS[0];
      this.state.currentUser = {
        ...current,
        id: userId,
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("foodrescue_auth_user", JSON.stringify(this.state.currentUser));
      }
    } else if (this.state.currentUser) {
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

    // Always synchronize logoUrl and storeData to persistent stores
    const currentU = this.state.currentUser;
    const storeIndex = this.state.stores.findIndex(
      (s) =>
        (currentU?.storeId && s.id === currentU.storeId) ||
        (currentU?.name && s.name.toLowerCase().includes(currentU.name.toLowerCase())) ||
        s.id === "store-ruby-bakery"
    );

    if (storeIndex !== -1) {
      const currentStore = this.state.stores[storeIndex];
      const targetLogo = data.storeData?.logoUrl || data.avatarUrl || currentStore.logoUrl;
      this.state.stores[storeIndex] = {
        ...currentStore,
        ...(targetLogo ? { logoUrl: targetLogo } : {}),
        ...(data.storeData?.name ? { name: data.storeData.name } : {}),
        ...(data.storeData?.area ? { area: data.storeData.area } : {}),
        ...(data.storeData?.pickupStartTime ? { pickupStartTime: data.storeData.pickupStartTime } : {}),
        ...(data.storeData?.pickupEndTime ? { pickupEndTime: data.storeData.pickupEndTime } : {}),
        ...(data.storeData?.address ? { address: data.storeData.address } : {}),
      };
    }

    this.persist();
  }

  // =====================
  // SELLER ONBOARDING / REGISTRATION
  // =====================
  public registerSeller(data: {
    ownerName: string;
    email: string;
    phone: string;
    storeName: string;
    category: StoreCategory;
    area: string;
    address: string;
    pickupStartTime: string;
    pickupEndTime: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    storeFrontImage?: string;
    logoUrl?: string;
  }): { user: User; store: Store } {
    const cleanEmail = data.email.trim().toLowerCase();
    const existingUser = this.state.stores.find((s) => s.name.toLowerCase() === data.storeName.trim().toLowerCase());
    if (existingUser) {
      throw new Error(`Nama gerai '${data.storeName}' sudah terdaftar.`);
    }

    const storeId = `store-${Date.now().toString(36)}`;
    const userId = `user-seller-${Date.now().toString(36)}`;

    const newStore: Store = {
      id: storeId,
      name: data.storeName.trim(),
      category: data.category,
      address: data.address.trim(),
      area: data.area,
      latitude: -6.72 + (Math.random() - 0.5) * 0.05,
      longitude: 108.55 + (Math.random() - 0.5) * 0.05,
      rating: 5.0,
      reviewCount: 0,
      isOpen: false,
      status: "PENDING_APPROVAL",
      logoUrl: data.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
      imageUrl: data.storeFrontImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
      pickupStartTime: data.pickupStartTime,
      pickupEndTime: data.pickupEndTime,
      boxComplianceRate: 100,
      boxesSoldTotal: 0,
      currentBoxStock: 0,
      walletBalance: 0,
      bankAccount: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder || data.ownerName,
      },
      kycDetails: {
        ownerName: data.ownerName.trim(),
        storeFrontImage: data.storeFrontImage,
        submittedAt: new Date().toISOString(),
      },
    };

    const newUser: User = {
      id: userId,
      name: data.ownerName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      role: "seller",
      storeId: storeId,
      status: "ACTIVE",
      avatarUrl: data.logoUrl || resolveUserAvatar(null, data.ownerName),
      createdAt: new Date().toISOString(),
    };

    this.state.stores.unshift(newStore);
    this.persist();

    return { user: newUser, store: newStore };
  }

  // =====================
  // STORES & SURPRISE BAGS
  // =====================
  public calculateStoreWalletBalance(storeId: string): number {
    const store = this.state.stores.find((s) => s.id === storeId);
    if (!store) return 0;

    // Hitung total hak bersih mitra toko dari SELURUH pesanan yang telah COMPLETED
    const completedOrdersEarnings = this.state.orders
      .filter((o) => o.storeId === storeId && o.status === "COMPLETED")
      .reduce((sum, o) => sum + (o.sellerEarning || Math.round((o.totalPrice || 0) * 0.9)), 0);

    // Hitung total penarikan dana mitra toko yang statusnya APPROVED atau PENDING
    const totalWithdrawals = (this.state.withdrawals || [])
      .filter((w) => w.storeId === storeId && (w.status === "APPROVED" || w.status === "PENDING"))
      .reduce((sum, w) => sum + w.amount, 0);

    const calculated = Math.max(0, completedOrdersEarnings - totalWithdrawals);
    if (completedOrdersEarnings === 0 && (store.walletBalance || 0) > 0) {
      return store.walletBalance;
    }
    return calculated;
  }

  public setStores(stores: Store[]) {
    this.state.stores = stores.map((incomingStore) => {
      const existing = this.state.stores.find((s) => s.id === incomingStore.id);
      const computedBalance = this.calculateStoreWalletBalance(incomingStore.id);

      return {
        ...incomingStore,
        logoUrl: incomingStore.logoUrl || existing?.logoUrl,
        walletBalance: computedBalance > 0 ? computedBalance : (existing?.walletBalance ?? incomingStore.walletBalance ?? 0),
        boxesSoldTotal: existing?.boxesSoldTotal ?? incomingStore.boxesSoldTotal,
        currentBoxStock: existing?.currentBoxStock ?? incomingStore.currentBoxStock,
      };
    });
    this.persist();
    this.notify();
  }

  public setSurpriseBags(bags: SurpriseBag[]) {
    this.state.surpriseBags = bags;
    this.notify();
  }

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

  public toggleBagFlashSale(bagId: string, isLastCall?: boolean) {
    this.state.surpriseBags = this.state.surpriseBags.map((b) => {
      if (b.id === bagId) {
        return {
          ...b,
          isLastCall: isLastCall !== undefined ? isLastCall : !b.isLastCall,
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

  public updateSurpriseBag(bagId: string, partialData: Partial<SurpriseBag>): SurpriseBag {
    const bagIndex = this.state.surpriseBags.findIndex((b) => b.id === bagId);
    if (bagIndex === -1) {
      throw new Error(`Surprise bag dengan ID '${bagId}' tidak ditemukan.`);
    }

    const updatedBag = {
      ...this.state.surpriseBags[bagIndex],
      ...partialData,
    };

    this.state.surpriseBags[bagIndex] = updatedBag;
    this.persist();
    return updatedBag;
  }

  public deleteSurpriseBag(bagId: string): void {
    const bagIndex = this.state.surpriseBags.findIndex((b) => b.id === bagId);
    if (bagIndex === -1) {
      throw new Error(`Surprise bag dengan ID '${bagId}' tidak ditemukan.`);
    }
    this.state.surpriseBags.splice(bagIndex, 1);
    this.persist();
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

    // Nomor pesanan unik e.g. "RB-8492" dan 4-digit PIN e.g. "4829"
    const orderId = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();

    const subtotalPrice = bag.discountedPrice * quantity;
    const adminFee = 1000; // Biaya layanan aplikasi Rp 1.000
    const totalPrice = subtotalPrice + adminFee;
    const platformFee = Math.round(subtotalPrice * 0.10); // 10% take-rate toko
    const sellerEarning = subtotalPrice - platformFee;

    const buyerName = guestDetails?.name || this.state.currentUser?.name || "Tamu";
    const buyerPhone = guestDetails?.phone || this.state.currentUser?.phone || "-";

    const newOrder: Order = {
      id: orderId,
      buyerId: guestDetails ? `guest-${Date.now()}` : (this.state.currentUser?.id || `guest-${Date.now()}`),
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
      pickupPin,
      pickupQrData: `RESCUE_ORDER:${orderId}`,
      pickupWindow: bag.pickupWindow,
      storeAddress: store.address,
      createdAt: new Date().toISOString(),
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

  public createMultiItemOrder(
    items: { bagId: string; quantity: number }[],
    paymentMethod: Order["paymentMethod"],
    guestDetails?: { name: string; phone: string }
  ): Order[] {
    if (!items || items.length === 0) throw new Error("Keranjang belanja kosong");

    const createdOrders: Order[] = [];
    for (const item of items) {
      const order = this.createOrder(item.bagId, paymentMethod, guestDetails, item.quantity);
      createdOrders.push(order);
    }
    return createdOrders;
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
      (o) =>
        (o.pickupCode === code || o.id === code || o.pickupPin === code) &&
        (o.status === "PAID" || o.status === "READY_FOR_PICKUP")
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

    // Release Escrow to Seller Wallet - Akumulasikan seluruh pesanan yang telah diselesaikan
    const store = this.state.stores.find((s) => s.id === order.storeId);
    if (store) {
      store.walletBalance = this.calculateStoreWalletBalance(store.id);
      store.boxesSoldTotal = (store.boxesSoldTotal || 0) + 1;
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

    const currentU = this.state.currentUser;
    const isSeller = currentU?.role === "seller";
    const store = isSeller
      ? this.state.stores.find((s) => s.id === order.storeId || s.id === currentU?.storeId)
      : null;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      senderRole: isSeller ? "seller" : "buyer",
      senderName: isSeller ? (store?.name || order.storeName) : (currentU?.name || "Tamu"),
      senderAvatarUrl: isSeller
        ? (store?.logoUrl || getDefaultAvatar(order.storeName))
        : (currentU?.avatarUrl || getDefaultAvatar(currentU?.name || "Tamu")),
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
  public addBoxPackage(pkg: Omit<RescueBoxPackage, "id"> & { id?: string }): RescueBoxPackage {
    const newPkg: RescueBoxPackage = {
      id: pkg.id || `box-${pkg.quantityPcs}-${Date.now().toString().slice(-4)}`,
      name: pkg.name,
      quantityPcs: pkg.quantityPcs,
      price: pkg.price,
      description: pkg.description,
      dimensions: pkg.dimensions,
    };
    this.state.boxPackages = [...this.state.boxPackages, newPkg];
    this.persist();
    return newPkg;
  }

  public updateBoxPackage(id: string, updates: Partial<RescueBoxPackage>): void {
    const idx = this.state.boxPackages.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.state.boxPackages[idx] = {
        ...this.state.boxPackages[idx],
        ...updates,
      };
      this.state.boxPackages = [...this.state.boxPackages];
      this.persist();
    }
  }

  public deleteBoxPackage(id: string): void {
    this.state.boxPackages = this.state.boxPackages.filter((p) => p.id !== id);
    this.persist();
  }

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

  public updateRescueBoxOrderStatus(
    orderId: string,
    status: RescueBoxOrder["status"],
    trackingNumber?: string
  ) {
    const orderIndex = this.state.boxOrders.findIndex((b) => b.id === orderId);
    if (orderIndex !== -1) {
      this.state.boxOrders[orderIndex] = {
        ...this.state.boxOrders[orderIndex],
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
      };
      this.state.boxOrders = [...this.state.boxOrders];
      this.persist();
    }
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
      buyerId: this.state.currentUser?.id || order.buyerId || "guest-1",
      buyerName: this.state.currentUser?.name || order.buyerName || "Pelanggan Rerasa",
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
    const storeIndex = this.state.stores.findIndex((s) => s.id === storeId);
    if (storeIndex !== -1) {
      this.state.stores[storeIndex] = {
        ...this.state.stores[storeIndex],
        status,
      };
      this.state.stores = [...this.state.stores];
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
    const estimatedKgSaved = totalOrdersCount * 0.8;

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
      totalMealsSaved: totalOrdersCount,
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
