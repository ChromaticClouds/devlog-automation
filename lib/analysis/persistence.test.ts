import type { PrismaClient } from "../../app/generated/prisma/client";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type { GitHubRepository } from "../github/repository-url";
import {
  AnalysisPersistenceError,
  storeAnalysisResult,
  type AnalysisPersistenceClient,
  type AnalysisPersistenceTransaction,
} from "./persistence";
import type { AnalysisResult } from "./result";

const repository: GitHubRepository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
  url: "https://github.com/ChromaticClouds/devlog-automation",
};

const result: AnalysisResult = {
  summary: "Repository activity summary.",
  technicalHighlights: ["Added strict validation."],
  portfolioBullets: ["Implemented a persistence boundary."],
  nextTasks: ["Add analysis orchestration."],
  risks: ["Persistence can fail."],
  markdown: "# Development Log",
};

function createClient(transaction: AnalysisPersistenceTransaction) {
  const runTransaction = vi.fn();
  const client: AnalysisPersistenceClient = {
    async $transaction<T>(
      operation: (value: AnalysisPersistenceTransaction) => Promise<T>,
    ): Promise<T> {
      runTransaction();
      return operation(transaction);
    },
  };

  return { client, runTransaction };
}

describe("storeAnalysisResult", () => {
  it("accepts the generated Prisma client through the minimal boundary", () => {
    expectTypeOf<PrismaClient>().toMatchTypeOf<AnalysisPersistenceClient>();
  });

  it("upserts the repository and creates the analysis in one transaction", async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 41 });
    const create = vi.fn().mockResolvedValue({ id: 73 });
    const { client, runTransaction } = createClient({
      repository: { upsert },
      analysisResult: { create },
    });

    const stored = await storeAnalysisResult({ repository, result }, client);

    expect(runTransaction).toHaveBeenCalledOnce();
    expect(upsert).toHaveBeenCalledWith({
      where: { url: repository.url },
      create: repository,
      update: {
        owner: repository.owner,
        name: repository.name,
      },
      select: { id: true },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        repositoryId: 41,
        ...result,
      },
      select: { id: true },
    });
    expect(stored).toEqual({
      analysisId: 73,
      repository,
      result,
    });
  });

  it("stores validated JSON list fields without mutation", async () => {
    const create = vi.fn().mockResolvedValue({ id: 73 });
    const { client } = createClient({
      repository: { upsert: vi.fn().mockResolvedValue({ id: 41 }) },
      analysisResult: { create },
    });

    await storeAnalysisResult({ repository, result }, client);

    const createInput = create.mock.calls[0][0];
    expect(createInput.data.technicalHighlights).toBe(
      result.technicalHighlights,
    );
    expect(createInput.data.portfolioBullets).toBe(result.portfolioBullets);
    expect(createInput.data.nextTasks).toBe(result.nextTasks);
    expect(createInput.data.risks).toBe(result.risks);
  });

  it("converts transaction failures into a safe project-owned error", async () => {
    const sensitiveError = new Error("password=secret database unavailable");
    const client: AnalysisPersistenceClient = {
      $transaction: vi.fn().mockRejectedValue(sensitiveError),
    };

    try {
      await storeAnalysisResult({ repository, result }, client);
      throw new Error("Expected persistence to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(AnalysisPersistenceError);
      expect(error).toMatchObject({
        message: "Analysis result persistence failed.",
      });
      expect(String(error)).not.toContain("password=secret");
      expect(error).not.toHaveProperty("cause");
    }
  });
});
