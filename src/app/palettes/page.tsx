import { CopySwatch } from "@/components/CopySwatch";
import { getFullAudit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PalettesPage() {
  const audit = await getFullAudit();

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rule">
        Colour systems
      </p>
      <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Same gold. Different blues.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Both palettes are 18 tokens in <code className="font-sans text-sm">src/lib/audit-data.ts</code> (and
        mirrored as CSS primitives in <code className="font-sans text-sm">src/app/globals.css @theme</code>).
        Cream, parchment, and gold-400 (#d4ad42) are shared metal. Identity lives in the blue — and
        in whether the third hue is pine/terracotta or rose/sage. Click a swatch to copy its hex.
      </p>

      <div className="mt-14 space-y-16">
        {audit.sites.map((entry) => {
          const groups = [...new Set(entry.tokens.map((token) => token.groupName))];
          return (
            <section key={entry.site.id}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p
                    className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: entry.site.themeColor }}
                  >
                    {entry.site.tokenPrefix}-*
                  </p>
                  <h2 className="font-display mt-2 text-3xl font-semibold">{entry.site.name}</h2>
                </div>
                <p className="font-sans text-xs uppercase tracking-[0.14em] text-ink-soft">
                  theme-color {entry.site.themeColor}
                </p>
              </div>
              {groups.map((group) => (
                <div key={group} className="mt-8">
                  <h3 className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    {group}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {entry.tokens
                      .filter((token) => token.groupName === group)
                      .map((token) => (
                        <CopySwatch
                          key={token.id}
                          token={token.token}
                          hex={token.hex}
                          usage={token.usage}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
