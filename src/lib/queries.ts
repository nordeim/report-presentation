import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  criteria,
  findings,
  paletteTokens,
  reviews,
  scores,
  sites,
  type Criterion,
  type Finding,
  type PaletteToken,
  type Review,
  type Score,
  type Site,
} from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export interface SiteAudit {
  site: Site;
  scores: Array<Score & { criterion: Criterion }>;
  tokens: PaletteToken[];
}

export interface FullAudit {
  sites: SiteAudit[];
  criteria: Criterion[];
  findings: Finding[];
  reviews: Review[];
}

export async function getFullAudit(): Promise<FullAudit> {
  await ensureSeeded();

  const [siteRows, criterionRows, scoreRows, findingRows, tokenRows, reviewRows] =
    await Promise.all([
      db.select().from(sites).orderBy(asc(sites.id)),
      db.select().from(criteria).orderBy(asc(criteria.sortOrder)),
      db.select().from(scores),
      db.select().from(findings).orderBy(asc(findings.id)),
      db.select().from(paletteTokens).orderBy(asc(paletteTokens.sortOrder)),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)),
    ]);

  const criterionById = new Map(criterionRows.map((row) => [row.id, row]));

  const siteAudits: SiteAudit[] = siteRows.map((site) => ({
    site,
    scores: scoreRows
      .filter((row) => row.siteId === site.id)
      .map((row) => {
        const criterion = criterionById.get(row.criterionId);
        if (!criterion) {
          throw new Error(`Score ${row.id} references missing criterion`);
        }
        return { ...row, criterion };
      })
      .sort((a, b) => a.criterion.sortOrder - b.criterion.sortOrder),
    tokens: tokenRows.filter((row) => row.siteId === site.id),
  }));

  return {
    sites: siteAudits,
    criteria: criterionRows,
    findings: findingRows,
    reviews: reviewRows,
  };
}

export async function insertReview(input: {
  reviewerName: string;
  preferredSite: string;
  visualScore: number;
  uxScore: number;
  a11yScore: number;
  comment: string;
}): Promise<Review> {
  await ensureSeeded();
  const [created] = await db.insert(reviews).values(input).returning();
  if (!created) {
    throw new Error("Failed to insert review");
  }
  return created;
}


