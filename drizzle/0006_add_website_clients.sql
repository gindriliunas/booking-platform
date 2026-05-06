-- Custom SQL migration file, put your code below! --
CREATE TYPE "public"."website_client_status" AS ENUM('building', 'preview_live', 'active', 'suspended', 'cancelled');
CREATE TYPE "public"."website_style" AS ENUM('clean_minimal', 'bold_modern', 'cinematic_3d');

CREATE TABLE "website_clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "business_name" text NOT NULL,
  "business_type" text NOT NULL,
  "brand_colours" text NOT NULL,
  "has_logo" boolean DEFAULT false NOT NULL,
  "logo_url" text,
  "description" text NOT NULL,
  "referral_source" text,
  "preferred_style" "website_style" DEFAULT 'clean_minimal' NOT NULL,
  "vercel_project_id" text,
  "preview_url" text,
  "custom_domain" text,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "stripe_checkout_session_id" text,
  "status" "website_client_status" DEFAULT 'building' NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);