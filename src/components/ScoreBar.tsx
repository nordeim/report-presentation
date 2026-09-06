interface ScoreBarProps {
  label: string;
  bsc: number;
  oll: number;
  compact?: boolean;
}

export function ScoreBar({ label, bsc, oll, compact = false }: ScoreBarProps) {
  const leader = bsc === oll ? "tie" : bsc > oll ? "bsc" : "oll";

  return (
    <div className={compact ? "py-2" : "py-3"}>
      <div className="mb-2 flex items-end justify-between gap-4">
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {label}
        </p>
        <p className="font-sans text-[0.7rem] tabular-nums text-ink-soft">
          <span className={leader === "bsc" ? "font-semibold text-bsc" : ""}>{bsc.toFixed(1)}</span>
          <span className="mx-1.5 text-ink/30">/</span>
          <span className={leader === "oll" ? "font-semibold text-oll" : ""}>{oll.toFixed(1)}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-bsc"
            style={{ width: `${(bsc / 10) * 100}%` }}
          />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-oll"
            style={{ width: `${(oll / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
