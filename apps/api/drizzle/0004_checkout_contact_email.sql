ALTER TABLE "checkouts" ADD COLUMN "contact_email" varchar(255);--> statement-breakpoint
ALTER TABLE "checkouts" ADD COLUMN "contact_email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "checkouts" ADD COLUMN "pending_contact_email" varchar(255);--> statement-breakpoint
ALTER TABLE "checkouts" ADD COLUMN "pending_contact_email_code_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "checkouts" ADD COLUMN "pending_contact_email_expires_at" timestamp with time zone;
