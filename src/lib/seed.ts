import { db } from "@/db";
import { criteria, findings, paletteTokens, scores, sites } from "@/db/schema";
import {
  CRITERIA_SEEDS,
  FINDING_SEEDS,
  PALETTE_SEEDS,
  SCORE_NOTES,
  SITE_SEEDS,
} from "@/lib/audit-data";

let seedPromise: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedAudit().catch((error: unknown) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function seedAudit() {
  const existing = await db.select({ id: sites.id }).from(sites).limit(1);
  if (existing.length > 0) {
    return;
  }

  try {
    await insertSeedRows();
  } catch (error) {
    const again = await db.select({ id: sites.id }).from(sites).limit(1);
    if (again.length > 0) {
      return;
    }
    throw error;
  }
}

async function insertSeedRows() {
  const insertedSites = await db
    .insert(sites)
    .values([...SITE_SEEDS])
    .returning();

  const insertedCriteria = await db
    .insert(criteria)
    .values([...CRITERIA_SEEDS])
    .returning();

  const siteBySlug = new Map(insertedSites.map((site) => [site.slug, site]));

  const scoreRows = insertedCriteria.flatMap((criterion) => {
    const notes = SCORE_NOTES[criterion.slug];
    if (!notes) {
      throw new Error(`Missing score notes for ${criterion.slug}`);
    }
    const bsc = siteBySlug.get("bsc");
    const oll = siteBySlug.get("oll");
    if (!bsc || !oll) {
      throw new Error("Expected both parish sites after seed");
    }
    return [
      {
        siteId: bsc.id,
        criterionId: criterion.id,
        score: notes.bsc.score,
        notes: notes.bsc.notes,
      },
      {
        siteId: oll.id,
        criterionId: criterion.id,
        score: notes.oll.score,
        notes: notes.oll.notes,
      },
    ];
  });

  await db.insert(scores).values(scoreRows);

  await db.insert(findings).values(
    FINDING_SEEDS.map((finding) => ({
      siteSlug: finding.siteSlug,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      evidence: finding.evidence,
      impact: finding.impact,
      recommendation: finding.recommendation,
      confidence: finding.confidence,
      dimension: finding.dimension,
    })),
  );

  const paletteRows = insertedSites.flatMap((site) => {
    const tokens = PALETTE_SEEDS[site.slug] ?? [];
    return tokens.map((token) => ({
      siteId: site.id,
      token: token.token,
      hex: token.hex,
      usage: token.usage,
      groupName: token.groupName,
      sortOrder: token.sortOrder,
    }));
  });

  await db.insert(paletteTokens).values(paletteRows);
}
