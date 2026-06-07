import { describe, expect, it, vi } from "vitest";

import { GitHubClientError } from "../github/client";
import type { GitHubRepository } from "../github/repository-url";
import type { NormalizedGitHubActivity } from "./activity";
import { GeminiAnalysisError } from "./gemini";
import {
  orchestrateRepositoryAnalysis,
  RepositoryAnalysisError,
  type RepositoryAnalysisDependencies,
} from "./orchestration";
import type { AnalysisResult } from "./result";

const repository: GitHubRepository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
  url: "https://github.com/ChromaticClouds/devlog-automation",
};
const result: AnalysisResult = {
  summary: "Summary",
  technicalHighlights: ["Highlight"],
  portfolioBullets: ["Bullet"],
  nextTasks: ["Next"],
  risks: ["Risk"],
  markdown: "# Log",
};
const activity = { repository } as NormalizedGitHubActivity;
const stored = { analysisId: 7, repository, result };

function createDependencies(): RepositoryAnalysisDependencies {
  return {
    parseRepositoryUrl: vi.fn().mockReturnValue(repository),
    fetchCommits: vi.fn().mockResolvedValue([]),
    fetchPullRequests: vi.fn().mockResolvedValue([]),
    fetchIssues: vi.fn().mockResolvedValue([]),
    fetchReadme: vi.fn().mockResolvedValue(null),
    fetchPackageMetadata: vi.fn().mockResolvedValue(null),
    normalizeActivity: vi.fn().mockReturnValue(activity),
    generateAnalysis: vi.fn().mockResolvedValue('{"summary":"raw"}'),
    parseResult: vi.fn().mockReturnValue(result),
    persistResult: vi.fn().mockResolvedValue(stored),
  };
}

describe("orchestrateRepositoryAnalysis", () => {
  it("rejects invalid input before starting later stages", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.parseRepositoryUrl).mockReturnValue(null);

    await expect(
      orchestrateRepositoryAnalysis("secret-invalid-input", dependencies),
    ).rejects.toMatchObject({
      category: "invalid_input",
      message: "GitHub repository URL is invalid.",
    });
    expect(dependencies.fetchCommits).not.toHaveBeenCalled();
    expect(dependencies.generateAnalysis).not.toHaveBeenCalled();
    expect(dependencies.persistResult).not.toHaveBeenCalled();
  });

  it("collects concurrently, then normalizes, validates, and persists", async () => {
    const dependencies = createDependencies();
    const started: string[] = [];
    let releaseCollectors = () => {};
    const pending = new Promise<void>((resolve) => {
      releaseCollectors = resolve;
    });
    const collector = <T>(name: string, value: T) =>
      vi.fn(async () => {
        started.push(name);
        await pending;
        return value;
      });
    dependencies.fetchCommits = collector("commits", []);
    dependencies.fetchPullRequests = collector("pullRequests", []);
    dependencies.fetchIssues = collector("issues", []);
    dependencies.fetchReadme = collector("readme", null);
    dependencies.fetchPackageMetadata = collector("packageMetadata", null);

    const analysis = orchestrateRepositoryAnalysis(repository.url, dependencies);
    await vi.waitFor(() => expect(started).toHaveLength(5));
    expect(dependencies.normalizeActivity).not.toHaveBeenCalled();
    releaseCollectors();

    await expect(analysis).resolves.toBe(stored);
    expect(dependencies.normalizeActivity).toHaveBeenCalledWith({
      repository,
      commits: [],
      pullRequests: [],
      issues: [],
      readme: null,
      packageMetadata: null,
    });
    expect(dependencies.generateAnalysis).toHaveBeenCalledWith(activity);
    expect(dependencies.parseResult).toHaveBeenCalledWith('{"summary":"raw"}');
    expect(dependencies.persistResult).toHaveBeenCalledWith({
      repository,
      result,
    });
    expect(vi.mocked(dependencies.normalizeActivity).mock.invocationCallOrder[0])
      .toBeLessThan(
        vi.mocked(dependencies.generateAnalysis).mock.invocationCallOrder[0],
      );
    expect(vi.mocked(dependencies.generateAnalysis).mock.invocationCallOrder[0])
      .toBeLessThan(
        vi.mocked(dependencies.parseResult).mock.invocationCallOrder[0],
      );
    expect(vi.mocked(dependencies.parseResult).mock.invocationCallOrder[0])
      .toBeLessThan(
        vi.mocked(dependencies.persistResult).mock.invocationCallOrder[0],
      );
  });

  it.each([
    [new GitHubClientError("not_found"), "not_found"],
    [new GitHubClientError("rate_limited"), "rate_limited"],
    [new GeminiAnalysisError("rate_limited"), "rate_limited"],
    [new GeminiAnalysisError("provider_error"), "processing_error"],
    [new Error("secret raw failure"), "processing_error"],
  ])("maps lower-level failures to %s", async (failure, category) => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.fetchCommits).mockRejectedValue(failure);

    try {
      await orchestrateRepositoryAnalysis(repository.url, dependencies);
      throw new Error("Expected orchestration to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(RepositoryAnalysisError);
      expect(error).toMatchObject({ category });
      expect(String(error)).not.toContain("secret raw failure");
      expect(error).not.toHaveProperty("cause");
    }
  });
});
