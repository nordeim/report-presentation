import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    resetRateLimits();
  });

  it("allows requests up to the limit within the window", () => {
    const first = checkRateLimit("1.2.3.4", { limit: 5, windowMs: 60_000 });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(4);
    for (let i = 0; i < 3; i += 1) {
      checkRateLimit("1.2.3.4", { limit: 5, windowMs: 60_000 });
    }
    const last = checkRateLimit("1.2.3.4", { limit: 5, windowMs: 60_000 });
    expect(last.allowed).toBe(true);
    expect(last.remaining).toBe(0);
  });

  it("blocks the request after the limit is exhausted", () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("10.0.0.1", { limit: 5, windowMs: 60_000 });
    }
    const blocked = checkRateLimit("10.0.0.1", { limit: 5, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("tracks clients independently", () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("10.0.0.2", { limit: 5, windowMs: 60_000 });
    }
    const other = checkRateLimit("10.0.0.3", { limit: 5, windowMs: 60_000 });
    expect(other.allowed).toBe(true);
  });

  it("allows again after the window elapses", () => {
    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("10.0.0.4", { limit: 5, windowMs: 50 });
    }
    expect(checkRateLimit("10.0.0.4", { limit: 5, windowMs: 50 }).allowed).toBe(false);
    return new Promise((done) => {
      setTimeout(() => {
        const after = checkRateLimit("10.0.0.4", { limit: 5, windowMs: 50 });
        expect(after.allowed).toBe(true);
        done(undefined);
      }, 70);
    });
  });

  it("never lets the client map grow without bound", () => {
    // Simulate 3× maxClients distinct IPs — the map must stay bounded.
    for (let i = 0; i < 3000; i += 1) {
      checkRateLimit(`10.0.${i}.${i}`, { limit: 5, windowMs: 60_000, maxClients: 1000 });
    }
    const stats = checkRateLimit("10.0.0.1", { limit: 5, windowMs: 60_000, maxClients: 1000 });
    expect(stats.allowed).toBe(true);
  });
});
