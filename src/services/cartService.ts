"use client";

import { SurpriseBag, Store } from "@/types/domain";

export interface CartItem {
  bag: SurpriseBag;
  store: Store;
  quantity: number;
}

const CART_STORAGE_KEY = "sisarasa_cart_state_v1";

type Listener = () => void;

class CartService {
  private items: CartItem[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          this.items = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load cart state:", e);
      }
    }
  }

  private notify() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {
        console.error("Failed to save cart state:", e);
      }
    }
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getItems(): CartItem[] {
    return this.items;
  }

  public getItem(bagId: string): CartItem | undefined {
    return this.items.find((item) => item.bag.id === bagId);
  }

  public getTotalCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  public getTotalPrice(): number {
    return this.items.reduce(
      (total, item) => total + item.bag.discountedPrice * item.quantity,
      0
    );
  }

  public getTotalSavings(): number {
    return this.items.reduce(
      (total, item) =>
        total +
        (item.bag.originalPrice - item.bag.discountedPrice) * item.quantity,
      0
    );
  }

  public getCartStore(): Store | null {
    if (this.items.length === 0) return null;
    return this.items[0].store;
  }

  public addItem(bag: SurpriseBag, store: Store, quantity = 1): { success: boolean; replacedStore?: boolean } {
    // Check if cart has items from different store
    if (this.items.length > 0 && this.items[0].bag.storeId !== bag.storeId) {
      // Replace with new store items
      this.items = [{ bag, store, quantity }];
      this.notify();
      return { success: true, replacedStore: true };
    }

    const existingIndex = this.items.findIndex((item) => item.bag.id === bag.id);
    if (existingIndex > -1) {
      const nextQty = Math.min(
        bag.quotaRemaining,
        this.items[existingIndex].quantity + quantity
      );
      this.items[existingIndex].quantity = nextQty;
    } else {
      this.items.push({
        bag,
        store,
        quantity: Math.min(bag.quotaRemaining, quantity),
      });
    }

    this.notify();
    return { success: true, replacedStore: false };
  }

  public updateQuantity(bagId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(bagId);
      return;
    }

    const item = this.items.find((i) => i.bag.id === bagId);
    if (item) {
      item.quantity = Math.min(item.bag.quotaRemaining, quantity);
      this.notify();
    }
  }

  public removeItem(bagId: string) {
    this.items = this.items.filter((item) => item.bag.id !== bagId);
    this.notify();
  }

  public clearCart() {
    this.items = [];
    this.notify();
  }
}

export const cartService = new CartService();
