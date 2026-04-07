ALTER TABLE "providers" ADD COLUMN "google_calendar_access_token" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "google_calendar_refresh_token" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "google_calendar_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "google_calendar_id" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "google_calendar_sync_enabled" boolean DEFAULT false NOT NULL;
