ALTER TABLE "orders" ADD COLUMN "subtotal_price" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "admin_fee" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE "surprise_bags" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "surprise_bags" ADD COLUMN "is_last_call" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;