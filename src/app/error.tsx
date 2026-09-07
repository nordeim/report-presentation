"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDb = /DATABASE_URL|audit seed|seed/i.test(error.message);

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
        Something went wrong
      </p>
      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        The journal couldn&apos;t load.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">
        {isDb
          ? "The database is not reachable. If you are running locally, start it with docker compose up -d postgres and ensure DATABASE_URL in .env.local matches docker-compose.yml (nave_spire_dev). Then reload."
          : "An unexpected error occurred while rendering this page."}
      </p>
      {error.message ? (
        <pre className="mt-6 overflow-auto rounded-[4px] border border-ink/10 bg-cream p-4 font-sans text-xs leading-relaxed text-ink-soft">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="font-sans rounded-[4px] bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-bsc-deep"
        >
          Try again
        </button>
        <a
          href="/api/health"
          className="font-sans rounded-[4px] border border-ink/15 bg-cream px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Check /api/health
        </a>
      </div>
    </main>
  );
}
