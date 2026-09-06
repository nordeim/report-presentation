import { insertReview } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ALLOWED_PREF = new Set(["bsc", "oll", "tie"]);

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asScore(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    return null;
  }
  return n;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const reviewerName = asString(record.reviewerName).trim();
  const preferredSite = asString(record.preferredSite).trim();
  const comment = asString(record.comment).trim();
  const visualScore = asScore(record.visualScore);
  const uxScore = asScore(record.uxScore);
  const a11yScore = asScore(record.a11yScore);

  if (reviewerName.length < 2 || reviewerName.length > 80) {
    return Response.json({ error: "Name must be 2–80 characters." }, { status: 400 });
  }
  if (!ALLOWED_PREF.has(preferredSite)) {
    return Response.json({ error: "Pick Blessed Sacrament, Our Lady of Lourdes, or a tie." }, { status: 400 });
  }
  if (comment.length < 12 || comment.length > 800) {
    return Response.json({ error: "Note must be 12–800 characters." }, { status: 400 });
  }
  if (visualScore === null || uxScore === null || a11yScore === null) {
    return Response.json({ error: "Scores must be whole numbers from 1 to 10." }, { status: 400 });
  }

  try {
    const review = await insertReview({
      reviewerName,
      preferredSite,
      visualScore,
      uxScore,
      a11yScore,
      comment,
    });
    return Response.json({ ok: true, review }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save review.";
    return Response.json({ error: message }, { status: 500 });
  }
}
