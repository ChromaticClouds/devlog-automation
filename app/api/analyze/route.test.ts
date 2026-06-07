import { describe, expect, it, vi } from "vitest";

import {
  RepositoryAnalysisError,
  type RepositoryAnalysisErrorCategory,
} from "../../../lib/analysis/orchestration";
import type { StoredAnalysisResult } from "../../../lib/analysis/persistence";
import {
  createAnalyzePostHandler,
  DELETE,
  GET,
  HEAD,
  OPTIONS,
  PATCH,
  PUT,
} from "./route";

const repoUrl = "https://github.com/ChromaticClouds/devlog-automation";
const storedResult: StoredAnalysisResult = {
  analysisId: 17,
  repository: {
    owner: "ChromaticClouds",
    name: "devlog-automation",
    url: repoUrl,
  },
  result: {
    summary: "Summary",
    technicalHighlights: ["Highlight"],
    portfolioBullets: ["Bullet"],
    nextTasks: ["Next"],
    risks: ["Risk"],
    markdown: "# Log",
  },
};

function request(body: string): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

async function expectError(
  response: Response,
  status: number,
  message: string,
) {
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ message });
}

describe("POST /api/analyze", () => {
  it("returns the stored result unchanged for a valid request", async () => {
    const analyze = vi.fn().mockResolvedValue(storedResult);
    const handler = createAnalyzePostHandler(analyze);

    const response = await handler(request(JSON.stringify({ repoUrl })));

    expect(analyze).toHaveBeenCalledOnce();
    expect(analyze).toHaveBeenCalledWith(repoUrl);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(storedResult);
  });

  it.each([
    ["malformed JSON", "{"],
    ["non-object body", JSON.stringify([])],
    ["missing repoUrl", JSON.stringify({})],
    ["non-string repoUrl", JSON.stringify({ repoUrl: 42 })],
    ["extra request field", JSON.stringify({ repoUrl, extra: true })],
  ])("rejects %s without calling analysis", async (_, body) => {
    const analyze = vi.fn();
    const handler = createAnalyzePostHandler(analyze);

    const response = await handler(request(body));

    await expectError(response, 400, "Analyze request body is invalid.");
    expect(analyze).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid_input", 400, "GitHub repository URL is invalid."],
    ["not_found", 404, "GitHub repository was not found."],
    ["rate_limited", 429, "Repository analysis rate limit was exceeded."],
    ["processing_error", 500, "Repository analysis failed."],
  ] satisfies [RepositoryAnalysisErrorCategory, number, string][])(
    "maps %s orchestration errors to %s",
    async (category, status, message) => {
      const analyze = vi.fn().mockRejectedValue(
        new RepositoryAnalysisError(category),
      );
      const handler = createAnalyzePostHandler(analyze);

      const response = await handler(request(JSON.stringify({ repoUrl })));

      await expectError(response, status, message);
    },
  );

  it("sanitizes unexpected exceptions", async () => {
    const analyze = vi
      .fn()
      .mockRejectedValue(new Error("secret provider and database details"));
    const handler = createAnalyzePostHandler(analyze);

    const response = await handler(request(JSON.stringify({ repoUrl })));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "Repository analysis failed." });
    expect(JSON.stringify(body)).not.toContain("secret");
  });
});

describe("unsupported /api/analyze methods", () => {
  it.each([
    ["GET", GET],
    ["HEAD", HEAD],
    ["PUT", PUT],
    ["PATCH", PATCH],
    ["DELETE", DELETE],
    ["OPTIONS", OPTIONS],
  ])("returns a predictable JSON 405 for %s", async (_, handler) => {
    const response = handler();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    expect(await response.json()).toEqual({ message: "Method not allowed." });
  });
});
