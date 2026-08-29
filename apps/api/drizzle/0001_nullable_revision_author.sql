ALTER TABLE "checkout_customization_revisions" DROP CONSTRAINT "checkout_customization_revisions_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "checkout_customization_revisions" ALTER COLUMN "created_by_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout_customization_revisions" ADD CONSTRAINT "checkout_customization_revisions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;