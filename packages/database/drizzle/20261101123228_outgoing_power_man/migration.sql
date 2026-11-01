ALTER TABLE "users" DROP CONSTRAINT "users_email_key";--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "users" (lower("email"));