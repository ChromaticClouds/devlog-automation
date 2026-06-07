import type { GitHubRepository } from "../github/repository-url";
import type { AnalysisResult } from "./result";

const PERSISTENCE_ERROR_MESSAGE = "Analysis result persistence failed.";

export class AnalysisPersistenceError extends Error {
  constructor() {
    super(PERSISTENCE_ERROR_MESSAGE);
    this.name = "AnalysisPersistenceError";
  }
}

export type StoreAnalysisResultInput = {
  repository: GitHubRepository;
  result: AnalysisResult;
};

export type StoredAnalysisResult = StoreAnalysisResultInput & {
  analysisId: number;
};

type RepositoryUpsertInput = {
  where: { url: string };
  create: GitHubRepository;
  update: Pick<GitHubRepository, "owner" | "name">;
  select: { id: true };
};

type AnalysisResultCreateInput = {
  data: AnalysisResult & { repositoryId: number };
  select: { id: true };
};

export type AnalysisPersistenceTransaction = {
  repository: {
    upsert(input: RepositoryUpsertInput): Promise<{ id: number }>;
  };
  analysisResult: {
    create(input: AnalysisResultCreateInput): Promise<{ id: number }>;
  };
};

export type AnalysisPersistenceClient = {
  $transaction<T>(
    operation: (transaction: AnalysisPersistenceTransaction) => Promise<T>,
  ): Promise<T>;
};

export async function storeAnalysisResult(
  input: StoreAnalysisResultInput,
  client: AnalysisPersistenceClient,
): Promise<StoredAnalysisResult> {
  try {
    return await client.$transaction(async (transaction) => {
      const repository = await transaction.repository.upsert({
        where: { url: input.repository.url },
        create: input.repository,
        update: {
          owner: input.repository.owner,
          name: input.repository.name,
        },
        select: { id: true },
      });
      const analysis = await transaction.analysisResult.create({
        data: {
          repositoryId: repository.id,
          ...input.result,
        },
        select: { id: true },
      });

      return {
        analysisId: analysis.id,
        repository: input.repository,
        result: input.result,
      };
    });
  } catch {
    throw new AnalysisPersistenceError();
  }
}
