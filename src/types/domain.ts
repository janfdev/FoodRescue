export type UserRole = "buyer" | "seller" | "super_admin";

export type StoreCategory = "Bakery & Pastry" | "Makanan Berat" | "Kafe & Minuman" | "Swalayan & Buah";

export type StoreStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";

export type EscrowStatus = "HELD" | "RELEASED_TO_SELLER" | "REFUNDED_TO_BUYER";

export type RescueBoxPackageId = "box-50" | "box-100" | "box-200";

export type BoxOrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type DisputeStatus = "OPEN" | "RESOLVED_REFUND" | "RESOLVED_DISMISSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl?: string;
  storeId?: string; // if role === 'seller'
  status?: "ACTIVE" | "SUSPENDED";
  createdAt?: string;
}

export interface Store {
  id: string;
  name: string;
  category: StoreCategory;
  address: string;
  area: string; // e.g. "Tuparev, Cirebon"
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  status: StoreStatus;
  pickupStartTime: string; // "19:00"
  pickupEndTime: string;   // "21:00"
  boxComplianceRate: number; // e.g. 96 (%)
  boxesSoldTotal: number;
  currentBoxStock: number;
  walletBalance: number;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  kycDetails?: {
    ktpNumber: string;
    ownerName: string;
    ktpImage: string;
    storeFrontImage: string;
    submittedAt: string;
  };
}

export interface SurpriseBag {
  id: string;
  storeId: string;
  title: string;
  category: StoreCategory;
  description: string;
  imageUrl?: string;
  originalPrice: number;
  discountedPrice: number;
  quotaToday: number;
  quotaRemaining: number;
  isActive: boolean;
  isLastCall?: boolean; // Penawaran kilat jelang toko tutup
  pickupWindow: string; // e.g. "19:30 - 21:00 WIB"
  estimatedWeightKg: number; // e.g. 0.8 kg per bag
  allergensWarning?: string;
}

export interface Order {
  id: string; // e.g. "RB-8492"
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  storeId: string;
  storeName: string;
  bagId: string;
  bagTitle: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice?: number;
  adminFee?: number; // Biaya layanan aplikasi (Rp 1.000)
  totalPrice: number;
  platformFee: number; // 12% take-rate toko
  sellerEarning: number; // 88%
  status: OrderStatus;
  paymentMethod: "QRIS" | "GoPay" | "ShopeePay" | "BCA_VA";
  paidAt?: string;
  pickupCode: string; // 4-digit PIN e.g. "4829"
  pickupQrData: string;
  completedAt?: string;
  isChatLocked: boolean; // locked 24h after completion
}

export interface EscrowAccount {
  id: string;
  orderId: string;
  heldAmount: number;
  status: EscrowStatus;
  heldAt: string;
  releasedAt?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderRole: "buyer" | "seller" | "system";
  senderName: string;
  text: string;
  timestamp: string;
}

export interface RescueBoxPackage {
  id: RescueBoxPackageId;
  name: string;
  quantityPcs: number;
  price: number;
  description: string;
  dimensions: string;
}

export interface RescueBoxOrder {
  id: string; // e.g. "BOX-ORD-102"
  storeId: string;
  storeName: string;
  packageId: RescueBoxPackageId;
  quantityPcs: number;
  totalPrice: number;
  shippingAddress: string;
  trackingNumber?: string;
  status: BoxOrderStatus;
  orderedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  storeId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1 - 5
  comment: string;
  usedOfficialRescueBox: boolean; // Compliance checklist
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
}

export interface DisputeTicket {
  id: string;
  orderId: string;
  buyerName: string;
  storeName: string;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
  adminNotes?: string;
}
