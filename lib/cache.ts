/**
 * Simple in-memory TTL cache for server-runtime usage only.
 * Not persisted across deployments and resets on process restart.
 */

type CacheValue<T> = { value: T; expiresAt: number };

class TTLCache {
  private store = new Map<string, CacheValue<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheValue<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const serverCache = new TTLCache();

/**
 * Wrap an async function with cache lookup and set.
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = serverCache.get<T>(key);
  if (cached !== undefined) return cached;
  const result = await fn();
  serverCache.set(key, result, ttlMs);
  return result;
}

/** Build a stable cache key for analytics requests. */
export function analyticsCacheKey(opts: {
  userId: string;
  endpoint: string; // e.g., "spend-over-time"
  params: URLSearchParams | Record<string, string | undefined | null>;
}): string {
  const { userId, endpoint, params } = opts;
  const entries: [string, string][] = [];
  if (params instanceof URLSearchParams) {
    params.forEach((v, k) => entries.push([k, v]));
  } else {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) entries.push([k, String(v)]);
    });
  }
  // Sort for stability
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const paramStr = entries.map(([k, v]) => `${k}=${v}`).join("&");
  return `analytics:${endpoint}:u=${userId}:${paramStr}`;
}
