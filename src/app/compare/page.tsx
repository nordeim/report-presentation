import Image from "next/image";
import { getFullAudit } from "@/lib/queries";
import { formatScore } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const audit = await getFullAudit();
  const bsc = audit.sites.find((item) => item.site.slug === "bsc");
  const oll = audit.sites.find((item) => item.site.slug === "oll");
  if (!bsc || !oll) {
    throw new Error("Audit seed missing parish sites");
  }

  const rows = audit.criteria.map((criterion) => {
    const bscScore = bsc.scores.find((row) => row.criterionId === criterion.id);
    const ollScore = oll.scores.find((row) => row.criterionId === criterion.id);
    if (!bscScore || !ollScore) {
      throw new Error(`Missing scores for ${criterion.slug}`);
    }
    const delta = Number((ollScore.score - bscScore.score).toFixed(1));
    return { criterion, bscScore, ollScore, delta };
  });

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
        Side by side
      </p>
      <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Ten notes, two voices.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Scores are out of ten. A positive delta favours Our Lady of Lourdes. Shared motion and
        layout score equally because they are the same CSS.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {[bsc, oll].map((entry) => (
          <article key={entry.site.slug} className="overflow-hidden rounded-[4px] border border-ink/10 bg-cream">
            <div className="relative h-52">
              <Image src={entry.site.heroImage} alt="" fill className="object-cover" />
            </div>
            <div className="p-6">
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft">
                {entry.site.shortName} · v{entry.site.version}
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold">{entry.site.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{entry.site.verdict}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 font-sans text-xs text-ink-soft">
                <div>
                  <dt className="uppercase tracking-[0.14em]">Display</dt>
                  <dd className="mt-1 text-ink">{entry.site.displayFont}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.14em]">Theme</dt>
                  <dd className="mt-1 tabular-nums text-ink">{entry.site.themeColor}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="uppercase tracking-[0.14em]">Live</dt>
                  <dd className="mt-1">
                    <a className="text-ink underline decoration-rule" href={entry.site.url} target="_blank" rel="noreferrer">
                      {entry.site.url.replace("https://", "")}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>

      <ol className="mt-16 space-y-10">
        {rows.map((row) => (
          <li key={row.criterion.id} className="border-t border-ink/10 pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-rule">
                  {String(row.criterion.sortOrder).padStart(2, "0")}
                </p>
                <h2 className="font-display mt-1 text-3xl font-semibold tracking-tight">
                  {row.criterion.name}
                </h2>
              </div>
              <p className="font-sans text-sm tabular-nums text-ink-soft">
                Δ {row.delta > 0 ? "+" : ""}
                {row.delta.toFixed(1)} {row.delta === 0 ? "tie" : row.delta > 0 ? "OLL" : "BSC"}
              </p>
            </div>
            <p className="mt-3 max-w-3xl text-ink-soft">{row.criterion.description}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[4px] bg-bsc-deep p-5 text-paper">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-rule-soft">
                  BSC · {formatScore(row.bscScore.score)}
                </p>
                <p className="font-source mt-3 text-sm leading-relaxed text-paper/80">
                  {row.bscScore.notes}
                </p>
              </div>
              <div className="rounded-[4px] bg-oll-deep p-5 text-paper">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-rule-soft">
                  OLL · {formatScore(row.ollScore.score)}
                </p>
                <p className="font-source mt-3 text-sm leading-relaxed text-paper/80">
                  {row.ollScore.notes}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
