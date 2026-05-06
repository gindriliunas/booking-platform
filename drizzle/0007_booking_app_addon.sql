ALTER TABLE "website_clients"
  ADD COLUMN "booking_app_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN "booking_app_stripe_subscription_id" text;
