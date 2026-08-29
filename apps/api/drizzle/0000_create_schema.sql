CREATE TYPE "public"."account_document_type" AS ENUM('cpf', 'cnpj');--> statement-breakpoint
CREATE TYPE "public"."account_revenue_range" AS ENUM('up_to_10k', 'from_10k_to_50k', 'from_50k_to_100k', 'above_100k');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('pending_onboarding', 'active', 'disabled', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."checkout_customization_source" AS ENUM('builder', 'json_import', 'ai');--> statement-breakpoint
CREATE TYPE "public"."checkout_event_type" AS ENUM('page_view', 'checkout_started', 'pix_generated', 'payment_paid', 'pix_expired');--> statement-breakpoint
CREATE TYPE "public"."pixel_provider" AS ENUM('facebook', 'utmify');--> statement-breakpoint
CREATE TYPE "public"."checkout_status" AS ENUM('draft', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."gateway_environment" AS ENUM('sandbox', 'production');--> statement-breakpoint
CREATE TYPE "public"."gateway_provider" AS ENUM('efibank');--> statement-breakpoint
CREATE TYPE "public"."gateway_status" AS ENUM('connected', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('awaiting_payment', 'paid', 'expired', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_webhook_event_status" AS ENUM('received', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pix');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'expired', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"business_name" varchar(160),
	"document" varchar(14),
	"document_type" "account_document_type",
	"phone" varchar(20),
	"contact_email" varchar(255),
	"sells_what" varchar(255),
	"estimated_revenue" "account_revenue_range",
	"status" "account_status" DEFAULT 'pending_onboarding' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "accounts_active_requires_onboarding" CHECK ("accounts"."status" <> 'active' or ("accounts"."business_name" is not null and "accounts"."document" is not null and "accounts"."phone" is not null))
);
--> statement-breakpoint
CREATE TABLE "buyers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"document" varchar(11) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_customization_revisions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checkout_id" varchar(36) NOT NULL,
	"customization" jsonb NOT NULL,
	"source" "checkout_customization_source" NOT NULL,
	"created_by_user_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_daily_metrics" (
	"account_id" varchar(36) NOT NULL,
	"checkout_id" varchar(36) NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"pix_generated" integer DEFAULT 0 NOT NULL,
	"orders_paid" integer DEFAULT 0 NOT NULL,
	"revenue_in_cents" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "checkout_daily_metrics_checkout_id_day_pk" PRIMARY KEY("checkout_id","day")
);
--> statement-breakpoint
CREATE TABLE "checkout_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"checkout_id" varchar(36) NOT NULL,
	"checkout_offer_id" varchar(36),
	"order_id" varchar(36),
	"type" "checkout_event_type" NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"utm" jsonb,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_offers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"checkout_id" varchar(36) NOT NULL,
	"offer_id" varchar(36) NOT NULL,
	"product_id" varchar(36) NOT NULL,
	"public_slug" varchar(160) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_pixels" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"checkout_id" varchar(36) NOT NULL,
	"provider" "pixel_provider" NOT NULL,
	"external_id" varchar(120) NOT NULL,
	"access_token" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkouts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"product_id" varchar(36) NOT NULL,
	"internal_title" varchar(120) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"banner_desktop_url" text,
	"banner_mobile_url" text,
	"customization" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "checkout_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "checkouts_id_product_unique" UNIQUE("id","product_id")
);
--> statement-breakpoint
CREATE TABLE "gateway_connections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"provider" "gateway_provider" NOT NULL,
	"environment" "gateway_environment" DEFAULT 'sandbox' NOT NULL,
	"status" "gateway_status" DEFAULT 'disconnected' NOT NULL,
	"credentials" jsonb NOT NULL,
	"pix_key" varchar(160),
	"last_error" text,
	"connected_at" timestamp with time zone,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"product_id" varchar(36) NOT NULL,
	"name" varchar(120) NOT NULL,
	"price_in_cents" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"delivery_url" text,
	"status" "offer_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "offers_id_product_unique" UNIQUE("id","product_id")
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"checkout_offer_id" varchar(36) NOT NULL,
	"checkout_id" varchar(36) NOT NULL,
	"offer_id" varchar(36) NOT NULL,
	"product_id" varchar(36) NOT NULL,
	"buyer_id" varchar(36) NOT NULL,
	"status" "order_status" DEFAULT 'awaiting_payment' NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"product_name_snapshot" varchar(120) NOT NULL,
	"offer_name_snapshot" varchar(120) NOT NULL,
	"delivery_url_snapshot" text NOT NULL,
	"buyer_name" varchar(160) NOT NULL,
	"buyer_email" varchar(255) NOT NULL,
	"buyer_document" varchar(11) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"delivery_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"provider" "gateway_provider" NOT NULL,
	"external_event_id" varchar(160) NOT NULL,
	"payment_id" varchar(36),
	"payload" jsonb NOT NULL,
	"status" "payment_webhook_event_status" DEFAULT 'received' NOT NULL,
	"error" text,
	"received_at" timestamp with time zone NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"provider" "gateway_provider" NOT NULL,
	"method" "payment_method" DEFAULT 'pix' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"external_charge_id" varchar(120) NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"qr_code_image_url" text,
	"qr_code_payload" text,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"image_url" text,
	"default_delivery_url" text,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" varchar(36) NOT NULL,
	"google_sub" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(160) NOT NULL,
	"avatar_url" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_customization_revisions" ADD CONSTRAINT "checkout_customization_revisions_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_customization_revisions" ADD CONSTRAINT "checkout_customization_revisions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_daily_metrics" ADD CONSTRAINT "checkout_daily_metrics_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_daily_metrics" ADD CONSTRAINT "checkout_daily_metrics_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_events" ADD CONSTRAINT "checkout_events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_events" ADD CONSTRAINT "checkout_events_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_events" ADD CONSTRAINT "checkout_events_checkout_offer_id_checkout_offers_id_fk" FOREIGN KEY ("checkout_offer_id") REFERENCES "public"."checkout_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_events" ADD CONSTRAINT "checkout_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_offers" ADD CONSTRAINT "checkout_offers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_offers" ADD CONSTRAINT "checkout_offers_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_offers" ADD CONSTRAINT "checkout_offers_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_offers" ADD CONSTRAINT "checkout_offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_offers" ADD CONSTRAINT "checkout_offers_checkout_product_fk" FOREIGN KEY ("checkout_id","product_id") REFERENCES "public"."checkouts"("id","product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_offers" ADD CONSTRAINT "checkout_offers_offer_product_fk" FOREIGN KEY ("offer_id","product_id") REFERENCES "public"."offers"("id","product_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_pixels" ADD CONSTRAINT "checkout_pixels_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_pixels" ADD CONSTRAINT "checkout_pixels_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gateway_connections" ADD CONSTRAINT "gateway_connections_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_offer_id_checkout_offers_id_fk" FOREIGN KEY ("checkout_offer_id") REFERENCES "public"."checkout_offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_document_unique" ON "accounts" USING btree ("document") WHERE "accounts"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "buyers_account_id_email_unique" ON "buyers" USING btree ("account_id","email");--> statement-breakpoint
CREATE INDEX "buyers_account_id_document_idx" ON "buyers" USING btree ("account_id","document");--> statement-breakpoint
CREATE INDEX "checkout_customization_revisions_checkout_id_created_at_idx" ON "checkout_customization_revisions" USING btree ("checkout_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "checkout_events_checkout_id_type_occurred_at_idx" ON "checkout_events" USING btree ("checkout_id","type","occurred_at");--> statement-breakpoint
CREATE INDEX "checkout_events_account_id_occurred_at_idx" ON "checkout_events" USING btree ("account_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_offers_public_slug_unique" ON "checkout_offers" USING btree ("public_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_offers_checkout_id_offer_id_unique" ON "checkout_offers" USING btree ("checkout_id","offer_id");--> statement-breakpoint
CREATE INDEX "checkout_offers_checkout_id_position_idx" ON "checkout_offers" USING btree ("checkout_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_pixels_checkout_id_provider_unique" ON "checkout_pixels" USING btree ("checkout_id","provider");--> statement-breakpoint
CREATE INDEX "checkouts_account_id_status_created_at_idx" ON "checkouts" USING btree ("account_id","status","created_at");--> statement-breakpoint
CREATE INDEX "checkouts_product_id_idx" ON "checkouts" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gateway_connections_account_id_provider_unique" ON "gateway_connections" USING btree ("account_id","provider");--> statement-breakpoint
CREATE INDEX "offers_account_id_product_id_status_idx" ON "offers" USING btree ("account_id","product_id","status");--> statement-breakpoint
CREATE INDEX "order_events_order_id_occurred_at_idx" ON "order_events" USING btree ("order_id","occurred_at");--> statement-breakpoint
CREATE INDEX "orders_account_id_status_created_at_idx" ON "orders" USING btree ("account_id","status","created_at");--> statement-breakpoint
CREATE INDEX "orders_checkout_id_created_at_idx" ON "orders" USING btree ("checkout_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_account_id_paid_at_idx" ON "orders" USING btree ("account_id","paid_at");--> statement-breakpoint
CREATE INDEX "orders_status_expires_at_idx" ON "orders" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_events_provider_external_event_id_unique" ON "payment_webhook_events" USING btree ("provider","external_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_external_charge_id_unique" ON "payments" USING btree ("provider","external_charge_id");--> statement-breakpoint
CREATE INDEX "payments_order_id_created_at_idx" ON "payments" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_order_id_pending_unique" ON "payments" USING btree ("order_id") WHERE "payments"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "products_account_id_status_created_at_idx" ON "products" USING btree ("account_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_hash_unique" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_sub_unique" ON "users" USING btree ("google_sub");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_account_id_idx" ON "users" USING btree ("account_id");