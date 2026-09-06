import { ReviewForm } from "@/components/ReviewForm";
import { getFullAudit } from "@/lib/queries";

export const dynamic = "force-dynamic";

function preferredLabel(value: string) {
  if (value === "bsc") return "Blessed Sacrament";
  if (value === "oll") return "Our Lady of Lourdes";
  return "Tie";
}

export default async function ReviewsPage() {
  const audit = await getFullAudit();

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
            Second readings
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Score the pair yourself.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Visual, UX, and accessibility — 1 to 10. Names are stored so the board can be a
            conversation, not an anonymous dump. No email.
          </p>
          <div className="mt-8 rounded-[4px] border border-ink/10 bg-cream p-6">
            <ReviewForm />
          </div>
        </section>

        <section>
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {audit.reviews.length} logged
          </p>
          <ol className="mt-6 space-y-4">
            {audit.reviews.length === 0 ? (
              <li className="rounded-[4px] border border-dashed border-ink/20 p-6 text-ink-soft">
                No visitor scores yet. Be the first second reader.
              </li>
            ) : (
              audit.reviews.map((review) => (
                <li key={review.id} className="rounded-[4px] border border-ink/10 bg-cream p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-xl font-semibold">{review.reviewerName}</p>
                    <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-rule">
                      Prefers {preferredLabel(review.preferredSite)}
                    </p>
                  </div>
                  <p className="font-sans mt-2 text-xs tabular-nums text-ink-soft">
                    Visual {review.visualScore} · UX {review.uxScore} · A11y {review.a11yScore}
                  </p>
                  <p className="mt-3 leading-relaxed text-ink-soft">{review.comment}</p>
                </li>
              ))
            )}
          </ol>
        </section>
      </div>
    </main>
  );
}
