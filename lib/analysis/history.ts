import type { GitHubRepository } from "../github/repository-url";
import type { AnalysisResult } from "./result";

const HISTORY_PERSISTENCE_ERROR_MESSAGE =
  "Analysis history persistence failed.";
const ANALYSIS_NOT_FOUND_MESSAGE = "Analysis result was not found.";

export class AnalysisHistoryPersistenceError extends Error {
  constructor() {
    super(HISTORY_PERSISTENCE_ERROR_MESSAGE);
    this.name = "AnalysisHistoryPersistenceError";
  }
}

export class AnalysisNotFoundError extends Error {
  constructor() {
    super(ANALYSIS_NOT_FOUND_MESSAGE);
    this.name = "AnalysisNotFoundError";
  }
}

export type AnalysisHistoryItem = {
  id: number;
  repositoryName: string;
  repositoryUrl: string;
  summary: string;
  createdAt: string;
};

export type AnalysisDetail = {
  id: number;
  repository: GitHubRepository;
  result: AnalysisResult;
  createdAt: string;
};

type StoredAnalysis = {
  id: number;
  summary: string;
  technicalHighlights: unknown;
  portfolioBullets: unknown;
  nextTasks: unknown;
  risks: unknown;
  markdown: string;
  createdAt: Date;
  repository: GitHubRepository;
};

type AnalysisHistoryRow = Pick<StoredAnalysis, "id" | "summary" | "createdAt"> & {
  repository: Pick<GitHubRepository, "name" | "url">;
};

export type AnalysisHistoryClient = {
  analysisResult: {
    findMany(input: {
      orderBy: { createdAt: "desc" };
      select: {
        id: true;
        summary: true;
        createdAt: true;
        repository: {
          select: { name: true; url: true };
        };
      };
    }): Promise<AnalysisHistoryRow[]>;
    findUnique(input: {
      where: { id: number };
      select: {
        id: true;
        summary: true;
        technicalHighlights: true;
        portfolioBullets: true;
        nextTasks: true;
        risks: true;
        markdown: true;
        createdAt: true;
        repository: {
          select: { owner: true; name: true; url: true };
        };
      };
    }): Promise<StoredAnalysis | null>;
  };
};

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new AnalysisHistoryPersistenceError();
  }

  return value;
}

function mapDetail(row: StoredAnalysis): AnalysisDetail {
  return {
    id: row.id,
    repository: row.repository,
    result: {
      summary: row.summary,
      technicalHighlights: parseStringArray(row.technicalHighlights),
      portfolioBullets: parseStringArray(row.portfolioBullets),
      nextTasks: parseStringArray(row.nextTasks),
      risks: parseStringArray(row.risks),
      markdown: row.markdown,
    },
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAnalysisHistory(
  client: AnalysisHistoryClient,
): Promise<AnalysisHistoryItem[]> {
  try {
    const rows = await client.analysisResult.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        summary: true,
        createdAt: true,
        repository: { select: { name: true, url: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      repositoryName: row.repository.name,
      repositoryUrl: row.repository.url,
      summary: row.summary,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch {
    throw new AnalysisHistoryPersistenceError();
  }
}

export async function getAnalysisDetail(
  id: number,
  client: AnalysisHistoryClient,
): Promise<AnalysisDetail> {
  let row: StoredAnalysis | null;

  try {
    row = await client.analysisResult.findUnique({
      where: { id },
      select: {
        id: true,
        summary: true,
        technicalHighlights: true,
        portfolioBullets: true,
        nextTasks: true,
        risks: true,
        markdown: true,
        createdAt: true,
        repository: { select: { owner: true, name: true, url: true } },
      },
    });
  } catch {
    throw new AnalysisHistoryPersistenceError();
  }

  if (!row) {
    throw new AnalysisNotFoundError();
  }

  return mapDetail(row);
}
