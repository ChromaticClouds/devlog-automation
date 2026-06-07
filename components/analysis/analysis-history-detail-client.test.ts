import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchAnalysisDetail,
  validateAnalysisDetail,
} from "./analysis-history-detail-client";

const detail = {
  id: 42,
  repository: {
    owner: "ChromaticClouds",
    name: "devlog-automation",
    url: "https://github.com/ChromaticClouds/devlog-automation",
  },
  result: {
    summary: "Repository activity summary.",
    technicalHighlights: ["Added history detail."],
    portfolioBullets: ["Built a stored analysis detail view."],
    nextTasks: ["Review the detail flow."],
    risks: ["Malformed detail responses must stay safe."],
    markdown: "# Development Log",
  },
  createdAt: "2026-06-07T07:00:00.000Z",
};

afterEach(() => vi.unstubAllGlobals());

describe("validateAnalysisDetail", () => {
  it("accepts the documented detail shape", () => {
    expect(validateAnalysisDetail(detail)).toEqual(detail);
  });

  it.each([
    { ...detail, extra: true },
    { ...detail, id: 0 },
    { ...detail, repository: { ...detail.repository, extra: true } },
    { ...detail, result: { ...detail.result, risks: [1] } },
    { ...detail, result: { ...detail.result, markdown: undefined } },
    { ...detail, createdAt: "not a date" },
  ])("rejects malformed detail responses", (body) => {
    expect(() => validateAnalysisDetail(body)).toThrow(
      "Analysis history request failed.",
    );
  });
});

describe("fetchAnalysisDetail", () => {
  it("returns validated detail responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(detail)));

    await expect(fetchAnalysisDetail("42")).resolves.toEqual(detail);
    expect(fetch).toHaveBeenCalledWith("/api/analyses/42");
  });

  it("preserves documented safe API messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { message: "Analysis result was not found." },
          { status: 404 },
        ),
      ),
    );

    await expect(fetchAnalysisDetail("404")).rejects.toThrow(
      "Analysis result was not found.",
    );
  });

  it("normalizes malformed JSON and rejected fetches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response("not json")).mockRejectedValue(
        new TypeError("secret service worker failure"),
      ),
    );

    await expect(fetchAnalysisDetail("42")).rejects.toThrow(
      "Analysis history request failed.",
    );
    await expect(fetchAnalysisDetail("42")).rejects.toThrow(
      "Analysis history request failed.",
    );
  });
});
