import { describe, expect, it, vi } from "vitest";

import {
  AnalysisHistoryPersistenceError,
  AnalysisNotFoundError,
  type AnalysisDetail,
} from "../../../../lib/analysis/history";
import {
  createAnalysisDetailGetHandler,
  DELETE,
  HEAD,
  OPTIONS,
  PATCH,
  POST,
  PUT,
} from "./route";

const detail: AnalysisDetail = {
  id: 12,
  repository: {
    owner: "ChromaticClouds",
    name: "devlog-automation",
    url: "https://github.com/ChromaticClouds/devlog-automation",
  },
  result: {
    summary: "Repository activity summary.",
    technicalHighlights: ["Added history routes."],
    portfolioBullets: ["Implemented safe API boundaries."],
    nextTasks: ["Add history UI."],
    risks: ["Invalid ids must not query persistence."],
    markdown: "# Development Log",
  },
  createdAt: "2026-06-07T06:00:00.000Z",
};

function request(id: string) {
  return [
    new Request(`http://localhost/api/analyses/${id}`),
    { params: Promise.resolve({ id }) },
  ] as const;
}

describe("GET /api/analyses/:id", () => {
  it("returns an analysis detail", async () => {
    const getDetail = vi.fn().mockResolvedValue(detail);
    const handler = createAnalysisDetailGetHandler(getDetail);

    const response = await handler(...request("12"));

    expect(getDetail).toHaveBeenCalledWith(12);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(detail);
  });

  it.each(["invalid", "1.5", "0", "-1", "", "9007199254740992"])(
    "rejects invalid id %j without querying persistence",
    async (id) => {
      const getDetail = vi.fn();
      const handler = createAnalysisDetailGetHandler(getDetail);

      const response = await handler(...request(id));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: "Analysis id is invalid.",
      });
      expect(getDetail).not.toHaveBeenCalled();
    },
  );

  it("maps missing analyses to a safe 404", async () => {
    const handler = createAnalysisDetailGetHandler(
      vi.fn().mockRejectedValue(new AnalysisNotFoundError()),
    );

    const response = await handler(...request("404"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      message: "Analysis result was not found.",
    });
  });

  it.each([
    new AnalysisHistoryPersistenceError(),
    new Error("postgresql://user:secret@database"),
  ])("sanitizes persistence and unknown failures", async (error) => {
    const handler = createAnalysisDetailGetHandler(
      vi.fn().mockRejectedValue(error),
    );

    const response = await handler(...request("12"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "Analysis history request failed." });
    expect(JSON.stringify(body)).not.toContain("secret");
  });
});

describe("unsupported /api/analyses/:id methods", () => {
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
