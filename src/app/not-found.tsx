import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
        404
      </p>
      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Folio not found.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">
        The page you are looking for is not in this issue. Try the verdict or the full ledger.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="font-sans rounded-[4px] bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-bsc-deep"
        >
          Back to verdict
        </Link>
        <Link
          href="/findings"
          className="font-sans rounded-[4px] border border-ink/15 bg-cream px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Open findings
        </Link>
      </div>
    </main>
  );
}
