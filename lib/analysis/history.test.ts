import type { PrismaClient } from "../../app/generated/prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  AnalysisHistoryPersistenceError,
  AnalysisNotFoundError,
  getAnalysisDetail,
  listAnalysisHistory,
  type AnalysisHistoryClient,
} from "./history";

const repository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
  url: "https://github.com/ChromaticClouds/devlog-automation",
};
const createdAt = new Date("2026-06-07T06:00:00.000Z");
const storedAnalysis = {
  id: 12,
  repository,
  summary: "Repository activity summary.",
  technicalHighlights: ["Added history reads."],
  portfolioBullets: ["Implemented a safe persistence boundary."],
  nextTasks: ["Add history routes."],
  risks: ["Stored JSON can be malformed."],
  markdown: "# Development Log",
  createdAt,
};

function createClient({
  findMany = vi.fn().mockResolvedValue([]),
  findUnique = vi.fn().mockResolvedValue(null),
} = {}): AnalysisHistoryClient {
  return { analysisResult: { findMany, findUnique } };
}

describe("listAnalysisHistory", () => {
  it("accepts the generated Prisma client through the read boundary", () => {
    const client: AnalysisHistoryClient = {} as PrismaClient;

    expect(client).toBeDefined();
  });

  it("selects and maps newest-first history items", async () => {
    const findMany = vi.fn().mockResolvedValue([storedAnalysis]);

    const items = await listAnalysisHistory(createClient({ findMany }));

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        summary: true,
        createdAt: true,
        repository: { select: { name: true, url: true } },
      },
    });
    expect(items).toEqual([
      {
        id: 12,
        repositoryName: repository.name,
        repositoryUrl: repository.url,
        summary: storedAnalysis.summary,
        createdAt: createdAt.toISOString(),
      },
    ]);
  });

  it("converts query failures into a safe persistence error", async () => {
    const client = createClient({
      findMany: vi
        .fn()
        .mockRejectedValue(new Error("postgresql://user:secret@database")),
    });

    await expect(listAnalysisHistory(client)).rejects.toMatchObject({
      name: "AnalysisHistoryPersistenceError",
      message: "Analysis history persistence failed.",
    });
  });
});

describe("getAnalysisDetail", () => {
  it("returns repository identity and validated result fields", async () => {
    const findUnique = vi.fn().mockResolvedValue(storedAnalysis);

    const detail = await getAnalysisDetail(
      12,
      createClient({ findUnique }),
    );

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 12 },
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
    expect(detail).toEqual({
      id: 12,
      repository,
      result: {
        summary: storedAnalysis.summary,
        technicalHighlights: storedAnalysis.technicalHighlights,
        portfolioBullets: storedAnalysis.portfolioBullets,
        nextTasks: storedAnalysis.nextTasks,
        risks: storedAnalysis.risks,
        markdown: storedAnalysis.markdown,
      },
      createdAt: createdAt.toISOString(),
    });
  });

  it("throws a project-owned not-found error for a missing analysis", async () => {
    await expect(getAnalysisDetail(404, createClient())).rejects.toBeInstanceOf(
      AnalysisNotFoundError,
    );
  });

  it("rejects malformed stored JSON with a safe persistence error", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      ...storedAnalysis,
      technicalHighlights: ["valid", 42],
    });

    await expect(
      getAnalysisDetail(12, createClient({ findUnique })),
    ).rejects.toBeInstanceOf(AnalysisHistoryPersistenceError);
  });

  it("converts detail query failures into a safe persistence error", async () => {
    const client = createClient({
      findUnique: vi.fn().mockRejectedValue(new Error("SELECT secret")),
    });

    await expect(getAnalysisDetail(12, client)).rejects.toMatchObject({
      name: "AnalysisHistoryPersistenceError",
      message: "Analysis history persistence failed.",
    });
  });
});
