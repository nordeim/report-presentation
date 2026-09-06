import Link from "next/link";

const LINKS = [
  { href: "/", label: "Verdict" },
  { href: "/compare", label: "Side by side" },
  { href: "/palettes", label: "Palettes" },
  { href: "/findings", label: "Findings" },
  { href: "/reviews", label: "Your scores" },
  { href: "/method", label: "Method" },
];

export function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-rule">
            Vol. I
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
            Nave &amp; Spire
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-5 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Mobile" className="flex gap-3 overflow-x-auto md:hidden">
          {LINKS.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
