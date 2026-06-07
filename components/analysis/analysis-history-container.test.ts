import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchAnalysisHistory } from "./analysis-history-client";

afterEach(() => vi.unstubAllGlobals());

describe("fetchAnalysisHistory", () => {
  it("returns validated history items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          items: [
            {
              id: 1,
              repositoryName: "repo",
              repositoryUrl: "https://github.com/owner/repo",
              summary: "Summary",
              createdAt: "2026-06-07T07:00:00.000Z",
            },
          ],
        }),
      ),
    );

    await expect(fetchAnalysisHistory()).resolves.toHaveLength(1);
  });

  it.each([
    { items: [{ id: 0 }] },
    { items: [{ id: 1, repositoryName: "repo" }] },
    { items: [], extra: true },
    { malformed: true },
  ])("rejects malformed success responses", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));

    await expect(fetchAnalysisHistory()).rejects.toThrow(
      "Analysis history request failed.",
    );
  });

  it("preserves safe API messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { message: "Analysis history request failed." },
          { status: 500 },
        ),
      ),
    );

    await expect(fetchAnalysisHistory()).rejects.toThrow(
      "Analysis history request failed.",
    );
  });

  it("uses the fallback for malformed JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not json", { status: 500 })),
    );

    await expect(fetchAnalysisHistory()).rejects.toThrow(
      "Analysis history request failed.",
    );
  });

  it("normalizes rejected fetches without exposing network details", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValue(new TypeError("secret service worker failure")),
    );

    try {
      await fetchAnalysisHistory();
      throw new Error("Expected history fetch to fail.");
    } catch (error) {
      expect(error).toMatchObject({
        message: "Analysis history request failed.",
      });
      expect(String(error)).not.toContain("secret");
    }
  });
});
