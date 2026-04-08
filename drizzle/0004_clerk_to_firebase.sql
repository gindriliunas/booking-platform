-- Rename clerk_user_id to firebase_uid in providers and clients tables
ALTER TABLE "providers" RENAME COLUMN "clerk_user_id" TO "firebase_uid";
ALTER TABLE "clients" RENAME COLUMN "clerk_user_id" TO "firebase_uid";
