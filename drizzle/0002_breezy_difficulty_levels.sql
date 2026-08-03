CREATE TABLE "difficulty_levels" (
	"key" "difficulty" PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#0ea5e9' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "difficulty_level_order_idx" ON "difficulty_levels" USING btree ("order");--> statement-breakpoint
INSERT INTO "difficulty_levels" ("key", "name", "color", "order", "is_active")
VALUES
	('co_ban', 'Cơ bản', '#2563eb', 1, true),
	('nang_cao', 'Nâng cao', '#f59e0b', 2, true)
ON CONFLICT ("key") DO UPDATE
SET "name" = excluded."name",
	"color" = excluded."color",
	"order" = excluded."order",
	"is_active" = excluded."is_active",
	"updated_at" = now();
