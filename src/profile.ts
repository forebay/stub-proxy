import type { RateLimitInfo, RoutingProfile } from "@intisy-ai/basekit/proxy";
import { anthropicTranslator } from "@intisy-ai/anthropic-translator";

/** The store key this proxy reads its own routing out of. */
export const CONFIG_FILE = "stub-proxy.json";

/**
 * The rate-limit response this proxy serves once every model in a chain is exhausted.
 *
 * @remarks
 * Passes the upstream provider's own 429 through verbatim when there is one, and synthesises a
 * minimal generic body only when every model failed before reaching a provider. A proxy for a real
 * app replaces the fallback with that app's own error shape, which is the one thing a front door
 * cannot borrow from another app.
 */
async function nativeRateLimit(info: RateLimitInfo): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  const upstream = info.upstream;
  if (upstream) {
    const headers: Record<string, string> = {};
    for (const [key, value] of upstream.headers) headers[key] = value;
    return { status: upstream.status, headers, body: await upstream.text() };
  }
  return {
    status: 429,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "rate limited" } }),
  };
}

/**
 * The smallest profile that is a working front door: a pure passthrough.
 *
 * @remarks
 * Tiering is what an app adds on top, not what it starts with, so the tier fields are empty and both
 * regexes are `(?!)`, which matches nothing and so offers no routing surface. An app that groups its
 * models into tiers fills `tierOrder`, `tierFallback` and `tierRegex` in; everything else here is
 * needed whether it tiers or not.
 *
 * @returns the profile a host hands to the routing engine
 */
export function stubProfile(): RoutingProfile {
  return {
    configFile: CONFIG_FILE,
    routingKey: "providerRouting",
    tierSourceProvider: "stub",
    tierOrder: [],
    tierFallback: [],
    tierRegex: /(?!)/,
    nativeModelPattern: /(?!)/,
    envPrefix: "STUB",
    defaultContext: 200000,
    defaultOutput: 64000,
    nativeRateLimit,
    translator: anthropicTranslator,
  };
}
