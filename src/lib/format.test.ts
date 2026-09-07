import { describe, expect, it } from "vitest";
import { confidenceLabel, contrastText, formatScore, severityClass, siteLabel } from "./format";

describe("formatScore", () => {
  it("renders one decimal", () => {
    expect(formatScore(8.67)).toBe("8.7");
    expect(formatScore(8.79)).toBe("8.8");
  });

  it("handles integers and boundary values", () => {
    expect(formatScore(9)).toBe("9.0");
    expect(formatScore(0)).toBe("0.0");
    expect(formatScore(10)).toBe("10.0");
  });
});

describe("severityClass", () => {
  it("maps every severity to a token-based class", () => {
    expect(severityClass("critical")).toBe("bg-rose/15 text-rose");
    expect(severityClass("high")).toBe("bg-high-sev/15 text-high-sev");
    expect(severityClass("medium")).toBe("bg-rule/15 text-gold-700");
    expect(severityClass("low")).toBe("bg-sage/15 text-sage");
    expect(severityClass("info")).toBe("bg-ink/10 text-ink-soft");
    expect(severityClass("unknown")).toBe("bg-ink/10 text-ink-soft");
  });

  it("emits no raw hex colors — all colors come from @theme tokens", () => {
    // AP-1 / SKILL §19: colors must come from @theme, not arbitrary hex.
    const severities = ["critical", "high", "medium", "low", "info", "anything"];
    for (const severity of severities) {
      expect(severityClass(severity)).not.toMatch(/#[0-9a-f]{6}/i);
    }
  });
});

describe("confidenceLabel", () => {
  it("maps confidence values to display labels", () => {
    expect(confidenceLabel("verified")).toBe("Verified in source");
    expect(confidenceLabel("reasoned")).toBe("Reasoned");
    expect(confidenceLabel("assumed")).toBe("Assumed");
  });

  it("passes unknown values through", () => {
    expect(confidenceLabel("mystery")).toBe("mystery");
  });
});

describe("siteLabel", () => {
  it("maps slugs and shared scope", () => {
    expect(siteLabel("bsc")).toBe("BSC");
    expect(siteLabel("oll")).toBe("OLL");
    expect(siteLabel(null)).toBe("Both");
    expect(siteLabel("other")).toBe("Both");
  });
});

describe("contrastText", () => {
  it("returns ink on light colors and paper on dark colors", () => {
    expect(contrastText("#f8f5ef")).toBe("#16130e");
    expect(contrastText("#f3eee4")).toBe("#16130e");
    expect(contrastText("#0a1122")).toBe("#f8f5ef");
    expect(contrastText("#16130e")).toBe("#f8f5ef");
  });

  it("falls back to ink for malformed input", () => {
    expect(contrastText("nothex")).toBe("#16130e");
    expect(contrastText("#123")).toBe("#16130e");
  });
});
