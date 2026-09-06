"use client";

import { useMemo, useState } from "react";
import type { Finding } from "@/db/schema";
import { confidenceLabel, severityClass, siteLabel } from "@/lib/format";

const SEVERITIES = ["all", "high", "medium", "low", "info"] as const;
const SCOPES = ["all", "bsc", "oll", "shared"] as const;

interface FindingsBoardProps {
  findings: Finding[];
}

export function FindingsBoard({ findings }: FindingsBoardProps) {
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("all");
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("all");

  const filtered = useMemo(() => {
    return findings.filter((finding) => {
      if (severity !== "all" && finding.severity !== severity) {
        return false;
      }
      if (scope === "shared" && finding.siteSlug !== null) {
        return false;
      }
      if (scope === "bsc" && finding.siteSlug !== "bsc") {
        return false;
      }
      if (scope === "oll" && finding.siteSlug !== "oll") {
        return false;
      }
      return true;
    });
  }, [findings, scope, severity]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSeverity(value)}
            className={`font-sans rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${
              severity === value ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"
            }`}
          >
            {value}
          </button>
        ))}
        <span className="mx-2 hidden h-6 w-px bg-ink/15 sm:block" />
        {SCOPES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setScope(value)}
            className={`font-sans rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${
              scope === value ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"
            }`}
          >
            {value === "shared" ? "Both" : value}
          </button>
        ))}
      </div>

      <ol className="mt-8 grid gap-5">
        {filtered.map((finding, index) => (
          <li
            key={finding.id}
            className="rounded-[4px] border border-ink/10 bg-cream p-6 shadow-[0_12px_40px_-24px_rgba(22,19,14,0.35)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[0.7rem] tabular-nums text-ink/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`font-sans rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${severityClass(finding.severity)}`}
              >
                {finding.severity}
              </span>
              <span className="font-sans rounded-full bg-ink/10 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                {siteLabel(finding.siteSlug)}
              </span>
              <span className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ink/40">
                {confidenceLabel(finding.confidence)}
              </span>
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight">{finding.title}</h2>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft">{finding.description}</p>
            <dl className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <dt className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-rule">
                  Evidence
                </dt>
                <dd className="mt-1.5 font-sans text-sm leading-relaxed text-ink-soft">{finding.evidence}</dd>
              </div>
              <div>
                <dt className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-rule">
                  Impact
                </dt>
                <dd className="mt-1.5 font-sans text-sm leading-relaxed text-ink-soft">{finding.impact}</dd>
              </div>
              <div>
                <dt className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-rule">
                  Fix
                </dt>
                <dd className="mt-1.5 font-sans text-sm leading-relaxed text-ink-soft">
                  {finding.recommendation}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      {filtered.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink-soft">No findings in this cut.</p>
      ) : null}
    </div>
  );
}
