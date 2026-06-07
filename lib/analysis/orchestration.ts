import { GitHubClientError } from "../github/client";
import { fetchRecentCommits } from "../github/commits";
import { fetchRecentIssues } from "../github/issues";
import { fetchPackageMetadata } from "../github/package-metadata";
import { fetchRecentPullRequests } from "../github/pull-requests";
import { fetchRepositoryReadme } from "../github/readme";
import {
  parseGitHubRepositoryUrl,
  type GitHubRepository,
} from "../github/repository-url";
import {
  normalizeGitHubActivity,
  type NormalizeGitHubActivityInput,
  type NormalizedGitHubActivity,
} from "./activity";
import { GeminiAnalysisError, sendActivityToGemini } from "./gemini";
import {
  storeAnalysisResult,
  type StoreAnalysisResultInput,
  type StoredAnalysisResult,
} from "./persistence";
import { parseAnalysisResult, type AnalysisResult } from "./result";

export type RepositoryAnalysisErrorCategory =
  | "invalid_input"
  | "not_found"
  | "rate_limited"
  | "processing_error";

const ERROR_MESSAGES: Record<RepositoryAnalysisErrorCategory, string> = {
  invalid_input: "GitHub repository URL is invalid.",
  not_found: "GitHub repository was not found.",
  rate_limited: "Repository analysis rate limit was exceeded.",
  processing_error: "Repository analysis failed.",
};

export class RepositoryAnalysisError extends Error {
  readonly category: RepositoryAnalysisErrorCategory;

  constructor(category: RepositoryAnalysisErrorCategory) {
    super(ERROR_MESSAGES[category]);
    this.name = "RepositoryAnalysisError";
    this.category = category;
  }
}

export type RepositoryAnalysisDependencies = {
  parseRepositoryUrl(input: string): GitHubRepository | null;
  fetchCommits: typeof fetchRecentCommits;
  fetchPullRequests: typeof fetchRecentPullRequests;
  fetchIssues: typeof fetchRecentIssues;
  fetchReadme: typeof fetchRepositoryReadme;
  fetchPackageMetadata: typeof fetchPackageMetadata;
  normalizeActivity(input: NormalizeGitHubActivityInput): NormalizedGitHubActivity;
  generateAnalysis(activity: NormalizedGitHubActivity): Promise<string>;
  parseResult(rawText: string): AnalysisResult;
  persistResult(input: StoreAnalysisResultInput): Promise<StoredAnalysisResult>;
};

const defaultDependencies: RepositoryAnalysisDependencies = {
  parseRepositoryUrl: parseGitHubRepositoryUrl,
  fetchCommits: fetchRecentCommits,
  fetchPullRequests: fetchRecentPullRequests,
  fetchIssues: fetchRecentIssues,
  fetchReadme: fetchRepositoryReadme,
  fetchPackageMetadata,
  normalizeActivity: normalizeGitHubActivity,
  generateAnalysis: sendActivityToGemini,
  parseResult: parseAnalysisResult,
  persistResult: async (input) => {
    const { default: prisma } = await import("../prisma");

    return storeAnalysisResult(input, prisma);
  },
};

function mapError(error: unknown): RepositoryAnalysisError {
  if (error instanceof RepositoryAnalysisError) {
    return error;
  }

  if (error instanceof GitHubClientError) {
    if (error.category === "not_found") {
      return new RepositoryAnalysisError("not_found");
    }

    if (error.category === "rate_limited") {
      return new RepositoryAnalysisError("rate_limited");
    }
  }

  if (
    error instanceof GeminiAnalysisError &&
    error.category === "rate_limited"
  ) {
    return new RepositoryAnalysisError("rate_limited");
  }

  return new RepositoryAnalysisError("processing_error");
}

export async function orchestrateRepositoryAnalysis(
  repoUrl: string,
  dependencies: RepositoryAnalysisDependencies = defaultDependencies,
): Promise<StoredAnalysisResult> {
  const repository = dependencies.parseRepositoryUrl(repoUrl);

  if (repository === null) {
    throw new RepositoryAnalysisError("invalid_input");
  }

  try {
    const [commits, pullRequests, issues, readme, packageMetadata] =
      await Promise.all([
        dependencies.fetchCommits(repository),
        dependencies.fetchPullRequests(repository),
        dependencies.fetchIssues(repository),
        dependencies.fetchReadme(repository),
        dependencies.fetchPackageMetadata(repository),
      ]);
    const activity = dependencies.normalizeActivity({
      repository,
      commits,
      pullRequests,
      issues,
      readme,
      packageMetadata,
    });
    const rawResult = await dependencies.generateAnalysis(activity);
    const result = dependencies.parseResult(rawResult);

    return await dependencies.persistResult({ repository, result });
  } catch (error) {
    throw mapError(error);
  }
}
