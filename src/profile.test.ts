import { describe, expect, it } from "vitest";
import { CONFIG_FILE, stubProfile } from "./profile.js";

describe("stubProfile", () => {
  it("offers no routing surface, because tiering is what an app adds on top", () => {
    const profile = stubProfile();
    expect(profile.tierOrder).toEqual([]);
    expect(profile.tierFallback).toEqual([]);
    expect(profile.tierRegex.test("claude-opus-4")).toBe(false);
  });

  it("carries a translator, which is what makes it an IR front door at all", () => {
    expect(stubProfile().translator).toBeDefined();
  });

  it("reads its routing out of its own store key", () => {
    expect(stubProfile().configFile).toBe(CONFIG_FILE);
  });

  it("passes an upstream rate limit through verbatim rather than inventing one", async () => {
    const upstream = new Response("upstream said no", { status: 429, headers: { "retry-after": "7" } });
    const answer = await stubProfile().nativeRateLimit({ upstream } as never);
    expect(answer.status).toBe(429);
    expect(answer.headers["retry-after"]).toBe("7");
    expect(answer.body).toBe("upstream said no");
  });

  it("synthesises a minimal 429 only when nothing upstream ever answered", async () => {
    const answer = await stubProfile().nativeRateLimit({} as never);
    expect(answer.status).toBe(429);
    expect(JSON.parse(answer.body).error.type).toBe("rate_limit_error");
  });
});
