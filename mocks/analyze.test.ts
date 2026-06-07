import { describe, expect, it } from "vitest";

import type { StoredAnalysisResult } from "../lib/analysis/persistence";
import {
  analyzeErrorResponses,
  analyzeSuccessResponse,
  createAnalyzeBadRequestHandler,
  createAnalyzeNotFoundHandler,
  createAnalyzeProcessingErrorHandler,
  createAnalyzeRateLimitedHandler,
  createAnalyzeSuccessHandler,
} from "./analyze";

describe("analyze MSW contract fixtures", () => {
  it("matches the documented success response shape", () => {
    const response: StoredAnalysisResult = analyzeSuccessResponse;

    expect(response).toMatchObject({
      analysisId: expect.any(Number),
      repository: {
        owner: expect.any(String),
        name: expect.any(String),
        url: expect.any(String),
      },
      result: {
        summary: expect.any(String),
        technicalHighlights: expect.any(Array),
        portfolioBullets: expect.any(Array),
        nextTasks: expect.any(Array),
        risks: expect.any(Array),
        markdown: expect.any(String),
      },
    });
    expect(response.repository.url).toBe(
      "https://github.com/ChromaticClouds/devlog-automation",
    );
  });

  it("keeps every documented error body to a safe message only", () => {
    expect(Object.values(analyzeErrorResponses)).toEqual([
      {
        status: 400,
        body: { message: "Analyze request body is invalid." },
      },
      {
        status: 404,
        body: { message: "GitHub repository was not found." },
      },
      {
        status: 429,
        body: { message: "Repository analysis rate limit was exceeded." },
      },
      {
        status: 500,
        body: { message: "Repository analysis failed." },
      },
    ]);

    for (const error of Object.values(analyzeErrorResponses)) {
      expect(Object.keys(error.body)).toEqual(["message"]);
      expect(JSON.stringify(error.body)).not.toMatch(
        /provider|model|prisma|database|stack/i,
      );
    }
  });

  it("exposes reusable handler helpers for future stories", () => {
    expect(createAnalyzeSuccessHandler()).toBeDefined();
    expect(createAnalyzeBadRequestHandler()).toBeDefined();
    expect(createAnalyzeNotFoundHandler()).toBeDefined();
    expect(createAnalyzeRateLimitedHandler()).toBeDefined();
    expect(createAnalyzeProcessingErrorHandler()).toBeDefined();
  });
});
