import { describe, expect, it, vi } from "vitest";

import type { AnalysisHistoryItem } from "../../../lib/analysis/history";
import {
  createAnalysisHistoryGetHandler,
  DELETE,
  HEAD,
  OPTIONS,
  PATCH,
  POST,
  PUT,
} from "./route";

const items: AnalysisHistoryItem[] = [
  {
    id: 12,
    repositoryName: "devlog-automation",
    repositoryUrl: "https://github.com/ChromaticClouds/devlog-automation",
    summary: "Repository activity summary.",
    createdAt: "2026-06-07T06:00:00.000Z",
  },
];

describe("GET /api/analyses", () => {
  it("returns analysis history items", async () => {
    const listHistory = vi.fn().mockResolvedValue(items);
    const handler = createAnalysisHistoryGetHandler(listHistory);

    const response = await handler();

    expect(listHistory).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items });
  });

  it("sanitizes persistence and unknown failures", async () => {
    const listHistory = vi
      .fn()
      .mockRejectedValue(new Error("postgresql://user:secret@database"));
    const handler = createAnalysisHistoryGetHandler(listHistory);

    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "Analysis history request failed." });
    expect(JSON.stringify(body)).not.toContain("secret");
  });
});

describe("unsupported /api/analyses methods", () => {
  it.each([
    ["HEAD", HEAD],
    ["POST", POST],
    ["PUT", PUT],
    ["PATCH", PATCH],
    ["DELETE", DELETE],
    ["OPTIONS", OPTIONS],
  ])("returns a predictable JSON 405 for %s", async (_, handler) => {
    const response = handler();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(await response.json()).toEqual({ message: "Method not allowed." });
  });
});
