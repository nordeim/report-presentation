import { FindingsBoard } from "@/components/FindingsBoard";
import { getFullAudit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FindingsPage() {
  const audit = await getFullAudit();
  const bySeverity = audit.findings.reduce(
    (acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
        Audit ledger
      </p>
      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Findings, not vibes.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Ordered as stored. Filter by severity or parish. Nothing here is Critical — both sites
        already sit above typical parish-web practice on focus, motion, and skip links.
      </p>
      <dl className="mt-8 flex flex-wrap gap-6 font-sans text-sm">
        {["high", "medium", "low", "info"].map((key) => (
          <div key={key}>
            <dt className="uppercase tracking-[0.16em] text-ink-soft">{key}</dt>
            <dd className="font-display text-3xl font-semibold tabular-nums">{bySeverity[key] ?? 0}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12">
        <FindingsBoard findings={audit.findings} />
      </div>
    </main>
  );
}
