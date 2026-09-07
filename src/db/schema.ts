import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * 6-table schema for the audit journal. This file is the reconstruction of
 * drizzle/0000_wise_gateway.sql — keep it byte-compatible with that
 * migration (verify: `npx drizzle-kit generate` must emit no new migration).
 * Foreign keys deliberately use ON DELETE no action (no cascades) — see
 * nave-spire_SKILL.md ADR-4.
 */

export const sites = pgTable("audit_sites", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  name: text("name").notNull(),
  shortName: varchar("short_name", { length: 16 }).notNull(),
  url: text("url").notNull(),
  repoUrl: text("repo_url").notNull(),
  tagline: text("tagline").notNull(),
  headline: text("headline").notNull(),
  displayFont: text("display_font").notNull(),
  bodyFont: text("body_font").notNull(),
  themeColor: varchar("theme_color", { length: 16 }).notNull(),
  architecture: text("architecture").notNull(),
  founded: text("founded").notNull(),
  address: text("address").notNull(),
  version: varchar("version", { length: 16 }).notNull(),
  heroImage: text("hero_image").notNull(),
  tokenPrefix: varchar("token_prefix", { length: 8 }).notNull(),
  overallScore: real("overall_score").notNull(),
  verdict: text("verdict").notNull(),
});

export const criteria = pgTable("audit_criteria", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const scores = pgTable("audit_scores", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id")
    .notNull()
    .references(() => sites.id),
  criterionId: integer("criterion_id")
    .notNull()
    .references(() => criteria.id),
  score: real("score").notNull(),
  notes: text("notes").notNull(),
});

export const findings = pgTable("audit_findings", {
  id: serial("id").primaryKey(),
  // Nullable siteSlug = shared finding (applies to both sites).
  siteSlug: varchar("site_slug", { length: 32 }),
  severity: varchar("severity", { length: 16 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  evidence: text("evidence").notNull(),
  impact: text("impact").notNull(),
  recommendation: text("recommendation").notNull(),
  confidence: varchar("confidence", { length: 16 }).notNull(),
  dimension: varchar("dimension", { length: 64 }).notNull(),
});

export const paletteTokens = pgTable("audit_palette_tokens", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id")
    .notNull()
    .references(() => sites.id),
  token: text("token").notNull(),
  hex: varchar("hex", { length: 16 }).notNull(),
  usage: text("usage").notNull(),
  groupName: varchar("group_name", { length: 32 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const reviews = pgTable("audit_reviews", {
  id: serial("id").primaryKey(),
  reviewerName: varchar("reviewer_name", { length: 80 }).notNull(),
  preferredSite: varchar("preferred_site", { length: 16 }).notNull(),
  visualScore: integer("visual_score").notNull(),
  uxScore: integer("ux_score").notNull(),
  a11yScore: integer("a11y_score").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type Criterion = typeof criteria.$inferSelect;
export type NewCriterion = typeof criteria.$inferInsert;
export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;
export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;
export type PaletteToken = typeof paletteTokens.$inferSelect;
export type NewPaletteToken = typeof paletteTokens.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
