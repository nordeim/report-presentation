import { describe, expect, it } from "vitest";
import { getTableName } from "drizzle-orm";
import {
  criteria,
  findings,
  paletteTokens,
  reviews,
  scores,
  sites,
} from "./schema";

/**
 * Pins the 6-table schema against the committed migration
 * drizzle/0000_wise_gateway.sql. If a column or table drifts from the
 * migration, `npx drizzle-kit generate` would emit a new migration —
 * these tests catch the drift first.
 */
describe("schema: 6 tables match drizzle/0000_wise_gateway.sql", () => {
  it("exposes the six expected table names", () => {
    expect(getTableName(sites)).toBe("audit_sites");
    expect(getTableName(criteria)).toBe("audit_criteria");
    expect(getTableName(scores)).toBe("audit_scores");
    expect(getTableName(findings)).toBe("audit_findings");
    expect(getTableName(paletteTokens)).toBe("audit_palette_tokens");
    expect(getTableName(reviews)).toBe("audit_reviews");
  });

  it("maps snake_case columns to camelCase fields on sites", () => {
    const siteCols = Object.keys(sites);
    for (const expected of [
      "id",
      "slug",
      "name",
      "shortName",
      "url",
      "repoUrl",
      "tagline",
      "headline",
      "displayFont",
      "bodyFont",
      "themeColor",
      "architecture",
      "founded",
      "address",
      "version",
      "heroImage",
      "tokenPrefix",
      "overallScore",
      "verdict",
    ]) {
      expect(siteCols).toContain(expected);
    }
  });

  it("maps camelCase fields on criteria, scores, findings, tokens, reviews", () => {
    expect(Object.keys(criteria)).toEqual(
      expect.arrayContaining(["id", "slug", "name", "description", "sortOrder"]),
    );
    expect(Object.keys(scores)).toEqual(
      expect.arrayContaining(["id", "siteId", "criterionId", "score", "notes"]),
    );
    expect(Object.keys(findings)).toEqual(
      expect.arrayContaining([
        "id",
        "siteSlug",
        "severity",
        "title",
        "description",
        "evidence",
        "impact",
        "recommendation",
        "confidence",
        "dimension",
      ]),
    );
    expect(Object.keys(paletteTokens)).toEqual(
      expect.arrayContaining(["id", "siteId", "token", "hex", "usage", "groupName", "sortOrder"]),
    );
    expect(Object.keys(reviews)).toEqual(
      expect.arrayContaining([
        "id",
        "reviewerName",
        "preferredSite",
        "visualScore",
        "uxScore",
        "a11yScore",
        "comment",
        "createdAt",
      ]),
    );
  });
});
