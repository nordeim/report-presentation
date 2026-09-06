import Image from "next/image";
import Link from "next/link";
import { ScoreBar } from "@/components/ScoreBar";
import { getFullAudit } from "@/lib/queries";
import { formatScore, severityClass, siteLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const audit = await getFullAudit();
  const bsc = audit.sites.find((item) => item.site.slug === "bsc");
  const oll = audit.sites.find((item) => item.site.slug === "oll");

  if (!bsc || !oll) {
    throw new Error("Audit seed missing parish sites");
  }

  const paired = audit.criteria.map((criterion) => {
    const bscScore = bsc.scores.find((row) => row.criterionId === criterion.id);
    const ollScore = oll.scores.find((row) => row.criterionId === criterion.id);
    if (!bscScore || !ollScore) {
      throw new Error(`Missing scores for ${criterion.slug}`);
    }
    return { criterion, bscScore, ollScore };
  });

  const counts = audit.findings.reduce(
    (acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main id="main">
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0">
          <Image
            src="/images/studio-hero.jpg"
            alt="Architecture critic's desk with two church photographs side by side"
            fill
            priority
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-rule-soft">
            Issue 01 · Singapore parishes · Visual &amp; UX
          </p>
          <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.95] tracking-tight">
            The tent
            <span className="text-rule-soft"> versus </span>
            the grotto.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-paper/75 sm:text-2xl">
            Two React parish sites. One shared scaffold. A modernist blue roof in Queenstown and a
            Gothic National Monument on Ophir Road — scored on identity, type, colour, motion, and
            whether a stranger can find Mass.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="font-sans rounded-[4px] bg-rule px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Open the comparison
            </Link>
            <a
              href="https://blessed-sacrament-church.jesspete.shop/"
              target="_blank"
              rel="noreferrer"
              className="font-sans rounded-[4px] border border-paper/25 px-5 py-2.5 text-sm font-semibold text-paper"
            >
              Visit BSC
            </a>
            <a
              href="https://our-lady-of-lourdes.jesspete.shop/"
              target="_blank"
              rel="noreferrer"
              className="font-sans rounded-[4px] border border-paper/25 px-5 py-2.5 text-sm font-semibold text-paper"
            >
              Visit OLL
            </a>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        {[bsc, oll].map((entry) => (
          <article key={entry.site.slug} className="relative min-h-[28rem] overflow-hidden bg-ink">
            <Image
              src={entry.site.heroImage}
              alt={entry.site.name}
              fill
              className="object-cover"
            />
            <div
              className={`absolute inset-0 ${
                entry.site.slug === "bsc"
                  ? "bg-gradient-to-t from-bsc-deep via-bsc-deep/45 to-transparent"
                  : "bg-gradient-to-t from-oll-deep via-oll-deep/45 to-transparent"
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 p-8 text-paper">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-rule-soft">
                {entry.site.shortName} · {entry.site.displayFont}
              </p>
              <h2
                className={`mt-2 text-4xl leading-tight text-paper sm:text-5xl ${
                  entry.site.slug === "bsc" ? "font-fraunces" : "font-cormorant"
                }`}
              >
                {entry.site.headline}
              </h2>
              <p className="font-source mt-3 max-w-md text-sm text-paper/75">{entry.site.architecture}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="gold-hairline mb-10" />
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
          Executive verdict
        </p>
        <h2 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          OLL wears the building. BSC has lived in the system longer.
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              These are sister implementations. Our Lady of Lourdes was rebuilt on the Blessed
              Sacrament architecture: same radii, same Ken Burns hero, same gold hairline, same
              drawer, same cream/parchment bands. The difference is not the grammar. It is the
              accent.
            </p>
            <p>
              <strong className="font-semibold text-ink">OLL</strong> scores higher on visual
              identity because Cormorant Garamond, a deeper Marian blue, and rose/sage accents
              belong to a Gothic Tamil parish. A dedicated Sacraments page and a public-holiday
              Mass card are the two UX moves BSC still lacks.
            </p>
            <p>
              <strong className="font-semibold text-ink">BSC</strong> scores higher on craft and on
              the Serve conversion path. Nineteen audit rounds left a thicker test harness, and
              Fraunces plus sapphire is an honest reading of the 1965 tent. The hospitality line —
              “You are not a visitor here. You are expected.” — is the best sentence on either
              site.
            </p>
          </div>
          <aside className="rounded-[4px] border border-ink/10 bg-cream p-6">
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Composite /10
            </p>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-bsc">BSC</p>
                <p className="font-display mt-1 text-5xl font-semibold tabular-nums">
                  {formatScore(bsc.site.overallScore)}
                </p>
              </div>
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-oll">OLL</p>
                <p className="font-display mt-1 text-5xl font-semibold tabular-nums">
                  {formatScore(oll.site.overallScore)}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-ink-soft">
              <p>High {counts.high ?? 0}</p>
              <p>Medium {counts.medium ?? 0}</p>
              <p>Low {counts.low ?? 0}</p>
              <p>Info {counts.info ?? 0}</p>
            </div>
            <p className="mt-6 font-sans text-xs leading-relaxed text-ink-soft">
              Equal-weight mean of ten criteria. Live SPA paint was not screenshot-audited —
              tokens, type, nav, and CSS are verified in source.
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-paper-deep/60 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
                Ten dimensions
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Where they part
              </h2>
            </div>
            <div className="font-sans flex gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
              <span className="text-bsc">Sapphire · BSC</span>
              <span className="text-oll">Marian · OLL</span>
            </div>
          </div>
          <div className="mt-10 grid gap-2">
            {paired.map((row) => (
              <ScoreBar
                key={row.criterion.id}
                label={row.criterion.name}
                bsc={row.bscScore.score}
                oll={row.ollScore.score}
              />
            ))}
          </div>
          <p className="mt-8">
            <Link href="/compare" className="font-sans text-sm font-semibold text-ink underline decoration-rule">
              Read the notes beside each score →
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
          Type as architecture
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <figure className="rounded-[4px] bg-bsc-deep p-8 text-paper sm:p-10">
            <figcaption className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-rule-soft">
              Fraunces · BSC
            </figcaption>
            <p className="font-fraunces mt-6 text-5xl leading-[1.05] sm:text-6xl">A tent of meeting.</p>
            <p className="font-source mt-6 max-w-sm text-sm leading-relaxed text-paper/70">
              Soft terminals, generous x-height, magazine warmth. A household — not a monument.
              Source Sans 3 carries the body on both sites.
            </p>
          </figure>
          <figure className="rounded-[4px] bg-oll-deep p-8 text-paper sm:p-10">
            <figcaption className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-rule-soft">
              Cormorant Garamond · OLL
            </figcaption>
            <p className="font-cormorant mt-6 text-5xl leading-[1.05] sm:text-6xl">The grotto in the city.</p>
            <p className="font-source mt-6 max-w-sm text-sm leading-relaxed text-paper/70">
              High contrast, sharp serifs, vertical stress. The definite article claims the
              landmark. More solemn, more Gothic, slightly more fragile at small sizes.
            </p>
          </figure>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/nave-light.jpg"
            alt="Sunlight through a church nave"
            fill
            className="object-cover opacity-25"
          />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
              Information architecture
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Two missing pages, inverted.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              BSC puts <em>Serve</em> in the primary nav and leaves sacraments under Worship. OLL
              puts <em>Sacraments</em> in the primary nav — Infant Baptism, Matrimony,
              Reconciliation, Anointing — and dropped Serve in the fork. Each is right about the
              page the other forgot.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[4px] border border-ink/10 bg-cream/90 p-5">
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-bsc">
                BSC primary
              </p>
              <ul className="mt-3 space-y-1.5 font-sans text-sm text-ink-soft">
                <li>Home</li>
                <li>About ▾ Parish / History / FAQ</li>
                <li>Worship ▾ Mass / Confession / Find Us</li>
                <li>Ministries ▾</li>
                <li>News &amp; Events</li>
                <li className="font-semibold text-ink">Serve</li>
              </ul>
            </div>
            <div className="rounded-[4px] border border-ink/10 bg-cream/90 p-5">
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-oll">
                OLL primary
              </p>
              <ul className="mt-3 space-y-1.5 font-sans text-sm text-ink-soft">
                <li>Home</li>
                <li>About ▾ Parish / History / FAQ</li>
                <li>Worship ▾ Mass / Reconciliation / Find Us</li>
                <li className="font-semibold text-ink">Sacraments ▾ four rites</li>
                <li>Ministries ▾</li>
                <li>News &amp; Events</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
              Findings
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
              The ledger, abbreviated
            </h2>
          </div>
          <Link href="/findings" className="font-sans text-sm font-semibold underline decoration-rule">
            Full board →
          </Link>
        </div>
        <ul className="mt-8 grid gap-4">
          {audit.findings.slice(0, 4).map((finding) => (
            <li key={finding.id} className="flex flex-wrap items-start gap-3 border-b border-ink/10 py-4">
              <span
                className={`font-sans rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${severityClass(finding.severity)}`}
              >
                {finding.severity}
              </span>
              <span className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ink/40">
                {siteLabel(finding.siteSlug)}
              </span>
              <p className="w-full font-display text-xl font-semibold tracking-tight sm:w-auto sm:flex-1">
                {finding.title}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
