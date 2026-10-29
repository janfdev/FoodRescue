import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  doublePrecision,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "admin"]);

export const storeCategoryEnum = pgEnum("store_category", [
  "Bakery & Pastry",
  "Makanan Berat",
  "Kafe & Minuman",
  "Swalayan & Buah",
]);

export const storeStatusEnum = pgEnum("store_status", [
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUSPENDED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_PAYMENT",
  "PAID",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
  "DISPUTED",
]);

export const escrowStatusEnum = pgEnum("escrow_status", [
  "HELD",
  "RELEASED_TO_SELLER",
  "REFUNDED_TO_BUYER",
]);

export const boxOrderStatusEnum = pgEnum("box_order_status", [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "OPEN",
  "RESOLVED_REFUND",
  "RESOLVED_DISMISSED",
]);

// ─── 1. USERS ────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  phone: text("phone").notNull().default("081234567890"),
  role: userRoleEnum("role").notNull().default("buyer"),
  status: text("status").notNull().default("ACTIVE"), // "ACTIVE" | "SUSPENDED"
  avatarUrl: text("avatar_url").default("https://api.dicebear.com/10.x/adventurer-neutral/svg"),
  storeId: text("store_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── 2. STORES ───────────────────────────────────────────────────────────────

export const stores = pgTable(
  "stores",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: storeCategoryEnum("category").notNull(),
    address: text("address").notNull(),
    area: text("area").notNull(), // e.g. "Tuparev, Cirebon"
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("5.00"),
    reviewCount: integer("review_count").notNull().default(0),
    isOpen: boolean("is_open").notNull().default(true),
    status: storeStatusEnum("status").notNull().default("PENDING_APPROVAL"),
    logoUrl: text("logo_url"),
    imageUrl: text("image_url"),
    pickupStartTime: text("pickup_start_time").notNull(), // "19:00"
    pickupEndTime: text("pickup_end_time").notNull(),     // "21:00"
    boxComplianceRate: integer("box_compliance_rate").notNull().default(100), // percentage e.g. 96
    boxesSoldTotal: integer("boxes_sold_total").notNull().default(0),
    currentBoxStock: integer("current_box_stock").notNull().default(50),
    walletBalance: integer("wallet_balance").notNull().default(0),
    bankAccount: jsonb("bank_account").$type<{
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }>(),
    kycDetails: jsonb("kyc_details").$type<{
      ownerName: string;
      storeFrontImage?: string;
      submittedAt: string;
      notes?: string;
      ktpNumber?: string;
      ktpImage?: string;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("stores_area_idx").on(table.area),
    index("stores_category_idx").on(table.category),
    index("stores_status_idx").on(table.status),
  ]
);

// ─── 3. SURPRISE BAGS ────────────────────────────────────────────────────────

export const surpriseBags = pgTable(
  "surprise_bags",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: storeCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    originalPrice: integer("original_price").notNull(),
    discountedPrice: integer("discounted_price").notNull(),
    quotaToday: integer("quota_today").notNull().default(10),
    quotaRemaining: integer("quota_remaining").notNull().default(10),
    isActive: boolean("is_active").notNull().default(true),
    isLastCall: boolean("is_last_call").notNull().default(false),
    pickupWindow: text("pickup_window").notNull(), // e.g. "19:30 - 21:00 WIB"
    estimatedWeightKg: doublePrecision("estimated_weight_kg").notNull().default(0.8),
    allergensWarning: text("allergens_warning"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("bags_store_idx").on(table.storeId),
    index("bags_is_active_idx").on(table.isActive),
  ]
);

// ─── 4. ORDERS ───────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(), // e.g. "RB-8492"
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id),
    buyerName: text("buyer_name").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id),
    storeName: text("store_name").notNull(),
    bagId: text("bag_id")
      .notNull()
      .references(() => surpriseBags.id),
    bagTitle: text("bag_title").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull(),
    subtotalPrice: integer("subtotal_price"),
    adminFee: integer("admin_fee").notNull().default(1000), // Biaya layanan aplikasi Rp 1.000
    totalPrice: integer("total_price").notNull(),
    platformFee: integer("platform_fee").notNull(),   // 12% take-rate toko
    sellerEarning: integer("seller_earning").notNull(), // 88%
    status: orderStatusEnum("status").notNull().default("PENDING_PAYMENT"),
    paymentMethod: text("payment_method").notNull().default("QRIS"),
    paidAt: timestamp("paid_at"),
    pickupCode: text("pickup_code").notNull(), // 4-digit PIN e.g. "4829"
    pickupQrData: text("pickup_qr_data").notNull(),
    completedAt: timestamp("completed_at"),
    isChatLocked: boolean("is_chat_locked").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_buyer_idx").on(table.buyerId),
    index("orders_store_idx").on(table.storeId),
    index("orders_status_idx").on(table.status),
    index("orders_pickup_code_idx").on(table.pickupCode),
  ]
);

// ─── 5. ESCROW ACCOUNTS ──────────────────────────────────────────────────────

export const escrowAccounts = pgTable("escrow_accounts", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  heldAmount: integer("held_amount").notNull(),
  status: escrowStatusEnum("status").notNull().default("HELD"),
  heldAt: timestamp("held_at").defaultNow().notNull(),
  releasedAt: timestamp("released_at"),
});

// ─── 6. CHAT MESSAGES ────────────────────────────────────────────────────────

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    senderRole: text("sender_role").notNull(), // "buyer" | "seller" | "system"
    senderName: text("sender_name").notNull(),
    senderAvatarUrl: text("sender_avatar_url"),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("chat_order_idx").on(table.orderId)]
);

// ─── 7. RESCUE BOX PACKAGES (B2B) ────────────────────────────────────────────

export const rescueBoxPackages = pgTable("rescue_box_packages", {
  id: text("id").primaryKey(), // e.g. "box-50"
  name: text("name").notNull(),
  quantityPcs: integer("quantity_pcs").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  dimensions: text("dimensions").notNull(),
});

// ─── 8. RESCUE BOX ORDERS ────────────────────────────────────────────────────

export const rescueBoxOrders = pgTable(
  "rescue_box_orders",
  {
    id: text("id").primaryKey(), // e.g. "BOX-ORD-102"
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id),
    storeName: text("store_name").notNull(),
    packageId: text("package_id")
      .notNull()
      .references(() => rescueBoxPackages.id),
    quantityPcs: integer("quantity_pcs").notNull(),
    totalPrice: integer("total_price").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    trackingNumber: text("tracking_number"),
    status: boxOrderStatusEnum("status").notNull().default("PENDING"),
    orderedAt: timestamp("ordered_at").defaultNow().notNull(),
  },
  (table) => [index("box_orders_store_idx").on(table.storeId)]
);

// ─── 9. REVIEWS & COMPLIANCE AUDIT ───────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id),
    buyerName: text("buyer_name").notNull(),
    rating: integer("rating").notNull(), // 1 - 5
    comment: text("comment").notNull(),
    usedOfficialRescueBox: boolean("used_official_rescue_box").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("reviews_store_idx").on(table.storeId)]
);

// ─── 10. WITHDRAWAL REQUESTS ─────────────────────────────────────────────────

export const withdrawalRequests = pgTable(
  "withdrawal_requests",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id),
    storeName: text("store_name").notNull(),
    amount: integer("amount").notNull(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolder: text("account_holder").notNull(),
    status: withdrawalStatusEnum("status").notNull().default("PENDING"),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => [index("withdrawals_store_idx").on(table.storeId)]
);

// ─── 11. DISPUTE TICKETS ─────────────────────────────────────────────────────

export const disputeTickets = pgTable(
  "dispute_tickets",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    buyerName: text("buyer_name").notNull(),
    storeName: text("store_name").notNull(),
    reason: text("reason").notNull(),
    status: disputeStatusEnum("status").notNull().default("OPEN"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("disputes_order_idx").on(table.orderId)]
);

// ─── 12. AUDIT LOGS ──────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").notNull(),
    actorName: text("actor_name").notNull(),
    actorRole: text("actor_role").notNull(), // "buyer" | "seller" | "admin" | "system"
    action: text("action").notNull(), // "ORDER_PAID" | "ORDER_HANDED_OVER" | "USER_SUSPENDED" | "USER_ACTIVATED" | "STORE_APPROVED" | "WITHDRAWAL_REQUESTED" | "WITHDRAWAL_APPROVED"
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    details: text("details"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_idx").on(table.createdAt),
  ]
);

// ─── RELATIONS ───────────────────────────────────────────────────────────────

export const storesRelations = relations(stores, ({ many }) => ({
  surpriseBags: many(surpriseBags),
  orders: many(orders),
  reviews: many(reviews),
  boxOrders: many(rescueBoxOrders),
  withdrawals: many(withdrawalRequests),
}));

export const surpriseBagsRelations = relations(surpriseBags, ({ one }) => ({
  store: one(stores, {
    fields: [surpriseBags.storeId],
    references: [stores.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  bag: one(surpriseBags, {
    fields: [orders.bagId],
    references: [surpriseBags.id],
  }),
  escrow: one(escrowAccounts, {
    fields: [orders.id],
    references: [escrowAccounts.orderId],
  }),
  chatMessages: many(chatMessages),
  review: one(reviews, {
    fields: [orders.id],
    references: [reviews.orderId],
  }),
  dispute: one(disputeTickets, {
    fields: [orders.id],
    references: [disputeTickets.orderId],
  }),
}));
