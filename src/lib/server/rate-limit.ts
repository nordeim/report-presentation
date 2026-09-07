/**
 * Minimal fixed-window rate limiter for the unauthenticated POST /api/reviews
 * endpoint (audit finding M2). In-memory by design: each server instance
 * tracks its own clients, so enforcement is per-instance and therefore
 * BEST-EFFORT ACROSS INSTANCES — live-verified 2026-09-08 that the deployed
 * host answers from more than one instance (or recycles them), meaning a clean
 * 6-request burst may not deterministically 429 (see
 * docs/CODE_AUDIT_2026-09-08.md M-A). A deterministic global limit needs a
 * shared store (e.g. Redis) — documented as future work in README "API
 * Reference" and CLAUDE.md Known Gap #8.
 *
 * The client map is bounded (maxClients, oldest-evicted) so unbounded
 * spoofed-IP traffic cannot exhaust memory.
 */

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
  /** Maximum distinct clients tracked before oldest-eviction. */
  maxClients?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets (present when blocked). */
  retryAfterSeconds?: number;
}

interface ClientRecord {
  count: number;
  windowStart: number;
}

const DEFAULTS: Required<RateLimitOptions> = {
  limit: 5,
  windowMs: 60_000,
  maxClients: 1000,
};

const clients = new Map<string, ClientRecord>();

export function checkRateLimit(
  clientId: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const { limit, windowMs, maxClients } = { ...DEFAULTS, ...options };
  const now = Date.now();

  if (!clients.has(clientId) && clients.size >= maxClients) {
    // Evict the oldest window to keep the map bounded.
    const oldestKey = clients.keys().next().value;
    if (oldestKey !== undefined) {
      clients.delete(oldestKey);
    }
  }

  const record = clients.get(clientId);
  if (!record || now - record.windowStart >= windowMs) {
    clients.set(clientId, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.windowStart + windowMs - now) / 1000),
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

/** Test/ops hook: clear all tracked clients. */
export function resetRateLimits() {
  clients.clear();
}
