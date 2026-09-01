CREATE TABLE "document_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "document_types" ADD COLUMN "category_id" uuid;--> statement-breakpoint
CREATE INDEX "document_category_order_idx" ON "document_categories" USING btree ("order");--> statement-breakpoint
ALTER TABLE "document_types" ADD CONSTRAINT "document_types_category_id_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_type_category_idx" ON "document_types" USING btree ("category_id");
