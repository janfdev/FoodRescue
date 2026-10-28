CREATE TYPE "public"."box_order_status" AS ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('OPEN', 'RESOLVED_REFUND', 'RESOLVED_DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."escrow_status" AS ENUM('HELD', 'RELEASED_TO_SELLER', 'REFUNDED_TO_BUYER');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING_PAYMENT', 'PAID', 'READY_FOR_PICKUP', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'DISPUTED');--> statement-breakpoint
CREATE TYPE "public"."store_category" AS ENUM('Bakery & Pastry', 'Makanan Berat', 'Kafe & Minuman', 'Swalayan & Buah');--> statement-breakpoint
CREATE TYPE "public"."store_status" AS ENUM('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"sender_role" text NOT NULL,
	"sender_name" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispute_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"buyer_name" text NOT NULL,
	"store_name" text NOT NULL,
	"reason" text NOT NULL,
	"status" "dispute_status" DEFAULT 'OPEN' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escrow_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"held_amount" integer NOT NULL,
	"status" "escrow_status" DEFAULT 'HELD' NOT NULL,
	"held_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	CONSTRAINT "escrow_accounts_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_phone" text NOT NULL,
	"store_id" text NOT NULL,
	"store_name" text NOT NULL,
	"bag_id" text NOT NULL,
	"bag_title" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer NOT NULL,
	"total_price" integer NOT NULL,
	"platform_fee" integer NOT NULL,
	"seller_earning" integer NOT NULL,
	"status" "order_status" DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"payment_method" text DEFAULT 'QRIS' NOT NULL,
	"paid_at" timestamp,
	"pickup_code" text NOT NULL,
	"pickup_qr_data" text NOT NULL,
	"completed_at" timestamp,
	"is_chat_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rescue_box_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"store_name" text NOT NULL,
	"package_id" text NOT NULL,
	"quantity_pcs" integer NOT NULL,
	"total_price" integer NOT NULL,
	"shipping_address" text NOT NULL,
	"tracking_number" text,
	"status" "box_order_status" DEFAULT 'PENDING' NOT NULL,
	"ordered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rescue_box_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"quantity_pcs" integer NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"dimensions" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"store_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"buyer_name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"used_official_rescue_box" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "store_category" NOT NULL,
	"address" text NOT NULL,
	"area" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"rating" numeric(3, 2) DEFAULT '5.00' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"status" "store_status" DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"pickup_start_time" text NOT NULL,
	"pickup_end_time" text NOT NULL,
	"box_compliance_rate" integer DEFAULT 100 NOT NULL,
	"boxes_sold_total" integer DEFAULT 0 NOT NULL,
	"current_box_stock" integer DEFAULT 50 NOT NULL,
	"wallet_balance" integer DEFAULT 0 NOT NULL,
	"bank_account" jsonb,
	"kyc_details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surprise_bags" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"title" text NOT NULL,
	"category" "store_category" NOT NULL,
	"description" text NOT NULL,
	"original_price" integer NOT NULL,
	"discounted_price" integer NOT NULL,
	"quota_today" integer DEFAULT 10 NOT NULL,
	"quota_remaining" integer DEFAULT 10 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"pickup_window" text NOT NULL,
	"estimated_weight_kg" double precision DEFAULT 0.8 NOT NULL,
	"allergens_warning" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"avatar_url" text,
	"store_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "withdrawal_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"store_name" text NOT NULL,
	"amount" integer NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_holder" text NOT NULL,
	"status" "withdrawal_status" DEFAULT 'PENDING' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_tickets" ADD CONSTRAINT "dispute_tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_bag_id_surprise_bags_id_fk" FOREIGN KEY ("bag_id") REFERENCES "public"."surprise_bags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_box_orders" ADD CONSTRAINT "rescue_box_orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_box_orders" ADD CONSTRAINT "rescue_box_orders_package_id_rescue_box_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."rescue_box_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surprise_bags" ADD CONSTRAINT "surprise_bags_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_order_idx" ON "chat_messages" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "disputes_order_idx" ON "dispute_tickets" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_buyer_idx" ON "orders" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "orders_store_idx" ON "orders" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_pickup_code_idx" ON "orders" USING btree ("pickup_code");--> statement-breakpoint
CREATE INDEX "box_orders_store_idx" ON "rescue_box_orders" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "reviews_store_idx" ON "reviews" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "stores_area_idx" ON "stores" USING btree ("area");--> statement-breakpoint
CREATE INDEX "stores_category_idx" ON "stores" USING btree ("category");--> statement-breakpoint
CREATE INDEX "stores_status_idx" ON "stores" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bags_store_idx" ON "surprise_bags" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "bags_is_active_idx" ON "surprise_bags" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "withdrawals_store_idx" ON "withdrawal_requests" USING btree ("store_id");