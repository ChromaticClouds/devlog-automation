import { http, HttpResponse } from "msw";

import type {
  AnalysisDetail,
  AnalysisHistoryItem,
} from "../lib/analysis/history";

const HISTORY_API_PATH = "*/api/analyses";
const HISTORY_DETAIL_API_PATH = "*/api/analyses/:id";

export type HistoryErrorResponse = { message: string };

export const historyItems: AnalysisHistoryItem[] = [
  {
    id: 42,
    repositoryName: "devlog-automation",
    repositoryUrl: "https://github.com/ChromaticClouds/devlog-automation",
    summary: "Repository activity was converted into a development log.",
    createdAt: "2026-06-07T07:00:00.000Z",
  },
  {
    id: 41,
    repositoryName: "work-automation",
    repositoryUrl: "https://github.com/ChromaticClouds/work-automation",
    summary: "Added reusable automation workflows.",
    createdAt: "2026-06-06T13:30:00.000Z",
  },
];

export const historyDetail: AnalysisDetail = {
  id: 42,
  repository: {
    owner: "ChromaticClouds",
    name: "devlog-automation",
    url: "https://github.com/ChromaticClouds/devlog-automation",
  },
  result: {
    summary: historyItems[0].summary,
    technicalHighlights: ["Added analysis history API contract mocks."],
    portfolioBullets: ["Built deterministic MSW history fixtures."],
    nextTasks: ["Connect the history list container."],
    risks: ["Mock and real API contracts must remain aligned."],
    markdown: "# Development Log",
  },
  createdAt: historyItems[0].createdAt,
};

export const historyErrorResponses = {
  invalidId: { message: "Analysis id is invalid." },
  notFound: { message: "Analysis result was not found." },
  processingError: { message: "Analysis history request failed." },
} satisfies Record<string, HistoryErrorResponse>;

export function createHistoryListSuccessHandler(
  items: AnalysisHistoryItem[] = historyItems,
) {
  return http.get(HISTORY_API_PATH, () => HttpResponse.json({ items }));
}

export const createHistoryListEmptyHandler = () =>
  createHistoryListSuccessHandler([]);

export function createHistoryListErrorHandler() {
  return http.get(HISTORY_API_PATH, () =>
    HttpResponse.json(historyErrorResponses.processingError, { status: 500 }),
  );
}

export function createHistoryDetailSuccessHandler(
  detail: AnalysisDetail = historyDetail,
) {
  return http.get(HISTORY_DETAIL_API_PATH, ({ params }) => {
    if (params.id !== String(detail.id)) {
      return HttpResponse.json(historyErrorResponses.notFound, { status: 404 });
    }

    return HttpResponse.json(detail);
  });
}

export function createHistoryDetailInvalidIdHandler() {
  return http.get(HISTORY_DETAIL_API_PATH, () =>
    HttpResponse.json(historyErrorResponses.invalidId, { status: 400 }),
  );
}

export function createHistoryDetailNotFoundHandler() {
  return http.get(HISTORY_DETAIL_API_PATH, () =>
    HttpResponse.json(historyErrorResponses.notFound, { status: 404 }),
  );
}

export function createHistoryDetailErrorHandler() {
  return http.get(HISTORY_DETAIL_API_PATH, () =>
    HttpResponse.json(historyErrorResponses.processingError, { status: 500 }),
  );
}
