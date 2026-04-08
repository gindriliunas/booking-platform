ALTER TABLE "packages" ADD COLUMN "is_free_trial_session" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "allow_self_book" boolean NOT NULL DEFAULT true;
