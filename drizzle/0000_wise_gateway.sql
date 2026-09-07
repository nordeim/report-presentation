CREATE TABLE "audit_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "audit_criteria_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_findings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_slug" varchar(32),
	"severity" varchar(16) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"evidence" text NOT NULL,
	"impact" text NOT NULL,
	"recommendation" text NOT NULL,
	"confidence" varchar(16) NOT NULL,
	"dimension" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_palette_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"token" text NOT NULL,
	"hex" varchar(16) NOT NULL,
	"usage" text NOT NULL,
	"group_name" varchar(32) NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewer_name" varchar(80) NOT NULL,
	"preferred_site" varchar(16) NOT NULL,
	"visual_score" integer NOT NULL,
	"ux_score" integer NOT NULL,
	"a11y_score" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"criterion_id" integer NOT NULL,
	"score" real NOT NULL,
	"notes" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"short_name" varchar(16) NOT NULL,
	"url" text NOT NULL,
	"repo_url" text NOT NULL,
	"tagline" text NOT NULL,
	"headline" text NOT NULL,
	"display_font" text NOT NULL,
	"body_font" text NOT NULL,
	"theme_color" varchar(16) NOT NULL,
	"architecture" text NOT NULL,
	"founded" text NOT NULL,
	"address" text NOT NULL,
	"version" varchar(16) NOT NULL,
	"hero_image" text NOT NULL,
	"token_prefix" varchar(8) NOT NULL,
	"overall_score" real NOT NULL,
	"verdict" text NOT NULL,
	CONSTRAINT "audit_sites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "audit_palette_tokens" ADD CONSTRAINT "audit_palette_tokens_site_id_audit_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."audit_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_scores" ADD CONSTRAINT "audit_scores_site_id_audit_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."audit_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_scores" ADD CONSTRAINT "audit_scores_criterion_id_audit_criteria_id_fk" FOREIGN KEY ("criterion_id") REFERENCES "public"."audit_criteria"("id") ON DELETE no action ON UPDATE no action;