export function formatScore(value: number) {
  return value.toFixed(1);
}

export function severityClass(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-rose/15 text-rose";
    case "high":
      return "bg-[#8f5038]/15 text-[#8f5038]";
    case "medium":
      return "bg-rule/15 text-[#85641c]";
    case "low":
      return "bg-sage/15 text-sage";
    default:
      return "bg-ink/10 text-ink-soft";
  }
}

export function confidenceLabel(value: string) {
  switch (value) {
    case "verified":
      return "Verified in source";
    case "reasoned":
      return "Reasoned";
    case "assumed":
      return "Assumed";
    default:
      return value;
  }
}

export function siteLabel(slug: string | null) {
  if (slug === "bsc") return "BSC";
  if (slug === "oll") return "OLL";
  return "Both";
}

export function contrastText(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return "#16130e";
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? "#16130e" : "#f8f5ef";
}
