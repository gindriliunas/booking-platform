CREATE TYPE "public"."late_cancel_outcome" AS ENUM('deducted', 'charged', 'charge_failed', 'requires_collection', 'waived');--> statement-breakpoint
CREATE TYPE "public"."recurrence_frequency" AS ENUM('weekly', 'biweekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('waiting', 'notified', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "booking_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"frequency" "recurrence_frequency" NOT NULL,
	"occurrences" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "late_cancellation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"cancelled_at" timestamp DEFAULT now() NOT NULL,
	"session_start_time" timestamp NOT NULL,
	"window_hours" integer NOT NULL,
	"action" text NOT NULL,
	"outcome" "late_cancel_outcome" NOT NULL,
	"stripe_payment_intent_id" text,
	"charge_amount_cents" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"status" "waitlist_status" DEFAULT 'waiting' NOT NULL,
	"notified_at" timestamp,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_entries_booking_id_client_id_unique" UNIQUE("booking_id","client_id")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_series_id" uuid;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "enable_waitlist" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "late_cancel_window_hours" integer;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "late_cancel_action" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "late_cancel_charge_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_cancellation_logs" ADD CONSTRAINT "late_cancellation_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_cancellation_logs" ADD CONSTRAINT "late_cancellation_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_cancellation_logs" ADD CONSTRAINT "late_cancellation_logs_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_series_id_booking_series_id_fk" FOREIGN KEY ("booking_series_id") REFERENCES "public"."booking_series"("id") ON DELETE set null ON UPDATE no action;