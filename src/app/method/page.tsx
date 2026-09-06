import { METHOD_NOTES } from "@/lib/audit-data";

export const dynamic = "force-dynamic";

const DIMENSIONS = [
  "Visual identity & parish fit",
  "Typography",
  "Colour system",
  "Layout & composition",
  "UI components",
  "Motion & interaction",
  "Accessibility",
  "Information architecture",
  "Voice & content craft",
  "Craft, trust & polish",
];

export default function MethodPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
        Method
      </p>
      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        How this reading was made.
      </h1>
      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>{METHOD_NOTES.liveShell}</p>
        <p>{METHOD_NOTES.confidence}</p>
      </div>

      <h2 className="font-display mt-14 text-2xl font-semibold">Sources</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
        <li>
          Live shells: blessed-sacrament-church.jesspete.shop and our-lady-of-lourdes.jesspete.shop
          (HTML head, CSP, fonts, theme-color, JSON-LD).
        </li>
        <li>
          Repositories: nordeim/blessed-sacrament-church and nordeim/ourladyoflourdes —{" "}
          <code className="font-sans text-sm">src/index.css</code>, nav.ts, pages/, components/,
          READMEs.
        </li>
        <li>
          Existing extract: docs/OLL_Church_Websites_Design_Audit_Report.md in the OLL repo, used as
          a prior — re-checked against current tokens rather than copied as truth.
        </li>
      </ul>

      <h2 className="font-display mt-14 text-2xl font-semibold">Scoring</h2>
      <p className="mt-4 text-ink-soft">
        Ten equally weighted criteria, 0–10, one decimal. Composite is the arithmetic mean. Ties are
        allowed and expected where the CSS is shared.
      </p>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-ink-soft">
        {DIMENSIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>

      <h2 className="font-display mt-14 text-2xl font-semibold">What would raise confidence</h2>
      <p className="mt-4 text-ink-soft">
        A headed browser pass over the running SPAs: hover lift, drawer focus trap, Ken Burns
        under reduced-motion, and whether the overlapping quote card still straddles the hero on
        the deployed hosts. Until then, motion and micro-interaction scores are reasoned from CSS
        utilities that both codebases declare.
      </p>
    </main>
  );
}
