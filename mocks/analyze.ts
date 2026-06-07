import { http, HttpResponse } from "msw";

import type { StoredAnalysisResult } from "../lib/analysis/persistence";

const ANALYZE_API_PATH = "/api/analyze";

export type AnalyzeErrorResponse = {
  message: string;
};

export type AnalyzeErrorMock = {
  status: 400 | 404 | 429 | 500;
  body: AnalyzeErrorResponse;
};

export type AnalyzeErrorMockKey =
  | "badRequest"
  | "notFound"
  | "rateLimited"
  | "processingError";

export const analyzeSuccessResponse: StoredAnalysisResult = {
  analysisId: 1,
  repository: {
    owner: "ChromaticClouds",
    name: "devlog-automation",
    url: "https://github.com/ChromaticClouds/devlog-automation",
  },
  result: {
    summary: "Recent GitHub activity was converted into a development log.",
    technicalHighlights: [
      "Collected GitHub activity through the project API contract.",
      "Normalized repository activity before generating analysis output.",
      "Rendered reusable Markdown output for portfolio and devlog workflows.",
    ],
    portfolioBullets: [
      "Built a repository analysis flow that turns GitHub activity into reusable development summaries.",
    ],
    nextTasks: [
      "Connect the repository URL form to the analysis container.",
      "Add persisted analysis history views.",
    ],
    risks: [
      "Provider or model failures should continue to return safe error messages.",
    ],
    markdown:
      "## Development Log\n\nRecent GitHub activity was converted into a reusable analysis summary.",
  },
};

export const analyzeErrorResponses: Record<
  AnalyzeErrorMockKey,
  AnalyzeErrorMock
> = {
  badRequest: {
    status: 400,
    body: { message: "Analyze request body is invalid." },
  },
  notFound: {
    status: 404,
    body: { message: "GitHub repository was not found." },
  },
  rateLimited: {
    status: 429,
    body: { message: "Repository analysis rate limit was exceeded." },
  },
  processingError: {
    status: 500,
    body: { message: "Repository analysis failed." },
  },
};

export function createAnalyzeSuccessHandler(
  response: StoredAnalysisResult = analyzeSuccessResponse,
) {
  return http.post(ANALYZE_API_PATH, () => HttpResponse.json(response));
}

export function createAnalyzeErrorHandler(errorKey: AnalyzeErrorMockKey) {
  const error = analyzeErrorResponses[errorKey];

  return http.post(ANALYZE_API_PATH, () =>
    HttpResponse.json(error.body, { status: error.status }),
  );
}

export const createAnalyzeBadRequestHandler = () =>
  createAnalyzeErrorHandler("badRequest");
export const createAnalyzeNotFoundHandler = () =>
  createAnalyzeErrorHandler("notFound");
export const createAnalyzeRateLimitedHandler = () =>
  createAnalyzeErrorHandler("rateLimited");
export const createAnalyzeProcessingErrorHandler = () =>
  createAnalyzeErrorHandler("processingError");
