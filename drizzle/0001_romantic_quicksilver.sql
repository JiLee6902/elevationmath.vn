CREATE TABLE "document_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"level" "education_level" NOT NULL,
	"grade" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "difficulty" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "difficulty" SET DEFAULT 'co_ban'::text;--> statement-breakpoint
DROP TYPE "public"."difficulty";--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('co_ban', 'nang_cao');--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "difficulty" SET DEFAULT 'co_ban'::"public"."difficulty";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "difficulty" SET DATA TYPE "public"."difficulty" USING "difficulty"::"public"."difficulty";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "document_type_id" uuid;--> statement-breakpoint
CREATE INDEX "document_type_grade_idx" ON "document_types" USING btree ("level","grade","order");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "doc_type";--> statement-breakpoint
DROP TYPE "public"."doc_type";