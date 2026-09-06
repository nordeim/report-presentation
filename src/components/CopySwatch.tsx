"use client";

import { useState } from "react";
import { contrastText } from "@/lib/format";

interface CopySwatchProps {
  token: string;
  hex: string;
  usage: string;
}

export function CopySwatch({ token, hex, usage }: CopySwatchProps) {
  const [copied, setCopied] = useState(false);
  const ink = contrastText(hex);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="group overflow-hidden rounded-[4px] border border-ink/10 text-left transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: hex, color: ink }}
    >
      <div className="aspect-[5/3] px-4 py-3">
        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-80">
          {copied ? "Copied" : token}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-current/15 px-4 py-2.5">
        <p className="font-sans text-xs tabular-nums">{hex}</p>
        <p className="font-sans truncate text-[0.65rem] opacity-75">{usage}</p>
      </div>
    </button>
  );
}
