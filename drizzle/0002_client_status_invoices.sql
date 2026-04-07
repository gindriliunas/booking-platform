ALTER TABLE "clients" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "invoice_business_name" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "invoice_address" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "invoice_tax_id" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "invoice_logo_url" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "invoice_footer_note" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "auto_send_invoice_on_package" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "auto_send_invoice_on_subscription" boolean DEFAULT false NOT NULL;
