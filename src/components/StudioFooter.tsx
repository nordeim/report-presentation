import Link from "next/link";

export function StudioFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-[0.7rem] uppercase tracking-[0.28em] text-rule-soft">
            A design journal
          </p>
          <p className="font-display mt-3 text-3xl font-semibold tracking-tight">Nave &amp; Spire</p>
          <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-paper/70">
            Two Singapore parish sites, one shared scaffold. This studio scores visual identity and
            UX from source tokens, components, and information architecture — not from mood.
          </p>
        </div>
        <div>
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-paper/50">
            The pair
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-paper/80">
            <li>
              <a
                className="hover:text-rule-soft"
                href="https://blessed-sacrament-church.jesspete.shop/"
                target="_blank"
                rel="noreferrer"
              >
                Blessed Sacrament →
              </a>
            </li>
            <li>
              <a
                className="hover:text-rule-soft"
                href="https://our-lady-of-lourdes.jesspete.shop/"
                target="_blank"
                rel="noreferrer"
              >
                Our Lady of Lourdes →
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-paper/50">
            In this issue
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-paper/80">
            <li>
              <Link className="hover:text-rule-soft" href="/compare">
                Side by side
              </Link>
            </li>
            <li>
              <Link className="hover:text-rule-soft" href="/findings">
                Findings
              </Link>
            </li>
            <li>
              <Link className="hover:text-rule-soft" href="/method">
                Method &amp; confidence
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="gold-hairline" />
      <p className="font-sans mx-auto max-w-6xl px-5 py-5 text-[0.7rem] uppercase tracking-[0.16em] text-paper/40 sm:px-8">
        Scores are reasoned from source. Live SPA paint was not screenshot-audited.
      </p>
    </footer>
  );
}
